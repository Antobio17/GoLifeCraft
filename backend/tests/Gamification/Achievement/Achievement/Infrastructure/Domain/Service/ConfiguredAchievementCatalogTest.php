<?php

namespace App\Tests\Gamification\Achievement\Achievement\Infrastructure\Domain\Service;

use Gamification\Achievement\Achievement\Infrastructure\Domain\Service\Configured\ConfiguredAchievementCatalog;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;

final class ConfiguredAchievementCatalogTest extends TestCase
{
    private const string PROJECT_DIR = __DIR__.'/../../../../../../..';
    private const string CATALOG_PATH = self::PROJECT_DIR.'/config/packages/achievements.yaml';
    private const string SUBSCRIBERS_PATH = self::PROJECT_DIR.'/src/Gamification/Achievement/Achievement/Infrastructure/Application/subscribers.yaml';
    private const string SUBSCRIBER_ID = 'Gamification\Achievement\Achievement\Application\Subscriber\RecordAchievementProgressOnTrackedEvent';

    public function testTheShippedCatalogIsValid(): void
    {
        $catalog = $this->shippedCatalog();

        $this->assertNotSame(expected: [], actual: $catalog->all());
        $this->assertNotNull(actual: $catalog->find(key: 'gym.workouts'));
    }

    public function testTheSubscriberListensToEveryEventTheCatalogTracks(): void
    {
        $subscribers = Yaml::parseFile(filename: self::SUBSCRIBERS_PATH);
        $subscribedEvents = array_column(array: $subscribers['services'][self::SUBSCRIBER_ID]['tags'], column_key: 'event');
        $trackedEvents = $this->shippedCatalog()->eventNames();

        sort(array: $subscribedEvents);
        sort(array: $trackedEvents);

        $this->assertSame(expected: $trackedEvents, actual: $subscribedEvents);
    }

    public function testEveryTrackedEventIsADomainEventThatExists(): void
    {
        $declaredEvents = [];
        $finder = (new Finder())->files()->in(dirs: self::PROJECT_DIR.'/src')->path(patterns: 'Domain/Event')->name(patterns: '*.php');

        foreach ($finder as $file) {
            preg_match_all(pattern: "/'(golifecraft\.[a-z_]+\.event\.1\.[a-z_.]+)'/", subject: $file->getContents(), matches: $matches);
            $declaredEvents = [...$declaredEvents, ...$matches[1]];
        }

        foreach ($this->shippedCatalog()->eventNames() as $eventName) {
            $this->assertContains(needle: $eventName, haystack: $declaredEvents);
        }
    }

    public function testItRejectsADefinitionDeclaredTwice(): void
    {
        $this->expectException(exception: \InvalidArgumentException::class);

        $definition = [
            'key' => 'gym.workouts',
            'module' => 'gym',
            'icon' => 'dumbbell',
            'metric' => 'count',
            'thresholds' => [1],
            'triggers' => [['event' => 'golifecraft.gym.event.1.workout.finished']],
        ];

        new ConfiguredAchievementCatalog(definitions: [$definition, $definition]);
    }

    public function testItRejectsThresholdsThatDoNotGrow(): void
    {
        $this->expectException(exception: \InvalidArgumentException::class);

        new ConfiguredAchievementCatalog(definitions: [[
            'key' => 'gym.workouts',
            'module' => 'gym',
            'icon' => 'dumbbell',
            'metric' => 'count',
            'thresholds' => [5, 5],
            'triggers' => [['event' => 'golifecraft.gym.event.1.workout.finished']],
        ]]);
    }

    private function shippedCatalog(): ConfiguredAchievementCatalog
    {
        $config = Yaml::parseFile(filename: self::CATALOG_PATH);

        return new ConfiguredAchievementCatalog(definitions: $config['parameters']['achievements.catalog']);
    }
}
