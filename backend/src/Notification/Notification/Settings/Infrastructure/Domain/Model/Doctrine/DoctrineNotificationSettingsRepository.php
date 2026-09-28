<?php

namespace Notification\Notification\Settings\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsRepository;

final class DoctrineNotificationSettingsRepository extends EntityRepository implements NotificationSettingsRepository
{
    public function findCurrent(): ?NotificationSettings
    {
        return $this->getEntityManager()->find(className: NotificationSettings::class, id: NotificationSettings::SINGLETON_ID);
    }

    public function save(NotificationSettings $notificationSettings): void
    {
        $this->getEntityManager()->persist(object: $notificationSettings);
    }
}
