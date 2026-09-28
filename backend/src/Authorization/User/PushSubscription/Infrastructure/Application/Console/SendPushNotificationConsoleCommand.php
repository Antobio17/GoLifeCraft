<?php

namespace Authorization\User\PushSubscription\Infrastructure\Application\Console;

use Authorization\User\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class SendPushNotificationConsoleCommand extends Command
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;

        parent::__construct(name: 'app:push:send');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Send a push notification to every device a user has subscribed. Devices whose subscription has expired are forgotten on the way.')
            ->addArgument(name: 'userId', mode: InputArgument::REQUIRED, description: 'Id of the user in the master database.')
            ->addArgument(name: 'title', mode: InputArgument::REQUIRED, description: 'Title of the notification.')
            ->addArgument(name: 'body', mode: InputArgument::REQUIRED, description: 'Body of the notification.')
            ->addOption(name: 'url', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'App path to open when the notification is tapped.', default: null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->handle(message: new SendPushNotificationCommand(
            userId: $input->getArgument('userId'),
            title: $input->getArgument('title'),
            body: $input->getArgument('body'),
            url: $input->getOption('url'),
        ));

        $output->writeln(messages: '<info>Push notification sent.</info>');

        return Command::SUCCESS;
    }
}
