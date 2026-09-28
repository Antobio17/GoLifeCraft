<?php

namespace Notification\Notification\PushSubscription\Infrastructure\Application\Console;

use Minishlink\WebPush\VAPID;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

final class GenerateVapidKeysCommand extends Command
{
    public function __construct()
    {
        parent::__construct(name: 'app:push:generate-vapid-keys');
    }

    protected function configure(): void
    {
        $this->setDescription(description: 'Print a fresh VAPID key pair to paste into .env.local as VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY. Rotating the pair invalidates every push subscription already stored.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $keys = VAPID::createVapidKeys();

        $output->writeln(messages: sprintf('VAPID_PUBLIC_KEY=%s', $keys['publicKey']));
        $output->writeln(messages: sprintf('VAPID_PRIVATE_KEY=%s', $keys['privateKey']));

        return Command::SUCCESS;
    }
}
