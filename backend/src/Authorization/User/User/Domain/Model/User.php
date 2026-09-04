<?php

namespace Authorization\User\User\Domain\Model;

use Authorization\User\User\Domain\Event\MyThemeChanged;
use Authorization\User\User\Domain\Event\MyVisualPreferenceChanged;
use Authorization\User\User\Domain\Event\UserAccessGranted;
use Authorization\User\User\Domain\Event\UserAccessRevoked;
use Authorization\User\User\Domain\Event\UserEmailVerified;
use Authorization\User\User\Domain\Event\UserImpersonated;
use Authorization\User\User\Domain\Event\UserRegistered;
use Authorization\User\User\Domain\Event\UserUpdated;
use Authorization\User\User\Domain\Exception\ChangeMyThemeException;
use Authorization\User\User\Domain\Exception\ChangeMyVisualPreferenceException;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends Aggregate implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const string ROLE_GOD = 'ROLE_GOD';
    public const string ROLE_USER = 'ROLE_USER';

    public const array ROLE_HERARCHY = [
        self::ROLE_GOD,
        self::ROLE_USER,
    ];

    public const string THEME_LIGHT = 'light';
    public const string THEME_DARK = 'dark';

    public const string VISUAL_MODE_IMAGE = 'image';
    public const string VISUAL_MODE_ICON = 'icon';

    public const array VISUAL_SURFACES = [
        'catalog',
        'globalCatalog',
        'recipe',
        'diary',
        'menu',
        'shopping',
        'kitchen',
    ];

    private int $version;

    public function __construct(
        public readonly string $id,
        public string $username,
        public readonly string $tenantId,
        public string $email,
        public string $name,
        public string $lastname,
        public string $password,
        public string $role,
        public bool $isActive,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
        public string $theme = self::THEME_DARK,
        public ?array $visualPreferences = null,
        public array $roles = [],
        public bool $emailVerified = false,
    ) {
    }

    public static function register(
        string $id,
        string $username,
        string $tenantId,
        string $email,
        string $name,
        string $lastname,
        string $plainPassword,
        string $role,
        PasswordHasher $passwordHasher,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $user = new self(
            id: $id,
            username: $username,
            tenantId: $tenantId,
            email: $email,
            name: $name,
            lastname: $lastname,
            password: '',
            role: $role,
            isActive: false,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $id,
            updatedByUserId: $id,
            emailVerified: false,
        );

        $user->password = $passwordHasher->hash(user: $user, plainPassword: $plainPassword);

        $user->record(event: new UserRegistered(
            aggregateId: $id,
            occurredOn: $now,
            username: $user->username,
            tenantId: $user->tenantId,
            email: $user->email,
            name: $user->name,
            lastname: $user->lastname,
            role: $user->role,
            roles: $user->roles,
            isActive: $user->isActive,
            emailVerified: $user->emailVerified,
            theme: $user->theme,
            visualPreferences: $user->visualPreferences,
            createdAt: $user->createdAt,
            updatedAt: $user->updatedAt,
            createdByUserId: $user->createdByUserId,
            updatedByUserId: $user->updatedByUserId,
        ));

        return $user;
    }

    public function verifyEmail(DateTimeGenerator $dateTimeGenerator): void
    {
        if ($this->emailVerified) {
            return;
        }

        $now = $dateTimeGenerator->now();

        $this->emailVerified = true;
        $this->updatedAt = $now;

        $this->record(event: new UserEmailVerified(
            aggregateId: $this->id,
            occurredOn: $now,
            username: $this->username,
            tenantId: $this->tenantId,
            email: $this->email,
            name: $this->name,
            lastname: $this->lastname,
            role: $this->role,
            roles: $this->roles,
            isActive: $this->isActive,
            emailVerified: $this->emailVerified,
            theme: $this->theme,
            visualPreferences: $this->visualPreferences,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function grantAccess(
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ($this->isActive) {
            return;
        }

        $now = $dateTimeGenerator->now();

        $this->isActive = true;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(event: new UserAccessGranted(
            aggregateId: $this->id,
            occurredOn: $now,
            username: $this->username,
            tenantId: $this->tenantId,
            email: $this->email,
            name: $this->name,
            lastname: $this->lastname,
            role: $this->role,
            roles: $this->roles,
            isActive: $this->isActive,
            emailVerified: $this->emailVerified,
            theme: $this->theme,
            visualPreferences: $this->visualPreferences,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function revokeAccess(
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isActive) {
            return;
        }

        $now = $dateTimeGenerator->now();

        $this->isActive = false;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(event: new UserAccessRevoked(
            aggregateId: $this->id,
            occurredOn: $now,
            username: $this->username,
            tenantId: $this->tenantId,
            email: $this->email,
            name: $this->name,
            lastname: $this->lastname,
            role: $this->role,
            roles: $this->roles,
            isActive: $this->isActive,
            emailVerified: $this->emailVerified,
            theme: $this->theme,
            visualPreferences: $this->visualPreferences,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function impersonate(
        string $impersonatorUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->record(event: new UserImpersonated(
            aggregateId: $this->id,
            occurredOn: $dateTimeGenerator->now(),
            username: $this->username,
            tenantId: $this->tenantId,
            email: $this->email,
            name: $this->name,
            lastname: $this->lastname,
            role: $this->role,
            roles: $this->roles,
            isActive: $this->isActive,
            emailVerified: $this->emailVerified,
            theme: $this->theme,
            visualPreferences: $this->visualPreferences,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
            impersonatorUserId: $impersonatorUserId,
        ));
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->id;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
    }

    public function updateProfile(
        string $name,
        string $lastname,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->lastname = $lastname;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new UserUpdated(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $this->username,
                tenantId: $this->tenantId,
                email: $this->email,
                name: $this->name,
                lastname: $this->lastname,
                role: $this->role,
                roles: $this->roles,
                isActive: $this->isActive,
                emailVerified: $this->emailVerified,
                theme: $this->theme,
                visualPreferences: $this->visualPreferences,
                createdAt: $this->createdAt,
                updatedAt: $this->updatedAt,
                createdByUserId: $this->createdByUserId,
                updatedByUserId: $this->updatedByUserId,
            )
        );
    }

    public function changePassword(
        string $hashedPassword,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->password = $hashedPassword;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new UserUpdated(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $this->username,
                tenantId: $this->tenantId,
                email: $this->email,
                name: $this->name,
                lastname: $this->lastname,
                role: $this->role,
                roles: $this->roles,
                isActive: $this->isActive,
                emailVerified: $this->emailVerified,
                theme: $this->theme,
                visualPreferences: $this->visualPreferences,
                createdAt: $this->createdAt,
                updatedAt: $this->updatedAt,
                createdByUserId: $this->createdByUserId,
                updatedByUserId: $this->updatedByUserId,
            )
        );
    }

    public function changeTheme(
        string $theme,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!in_array(needle: $theme, haystack: self::getValidThemes(), strict: true)) {
            throw ChangeMyThemeException::invalidTheme(theme: $theme);
        }

        $now = $dateTimeGenerator->now();

        $this->theme = $theme;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new MyThemeChanged(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $this->username,
                tenantId: $this->tenantId,
                email: $this->email,
                name: $this->name,
                lastname: $this->lastname,
                role: $this->role,
                roles: $this->roles,
                isActive: $this->isActive,
                emailVerified: $this->emailVerified,
                theme: $this->theme,
                visualPreferences: $this->visualPreferences,
                createdAt: $this->createdAt,
                updatedAt: $this->updatedAt,
                createdByUserId: $this->createdByUserId,
                updatedByUserId: $this->updatedByUserId,
            )
        );
    }

    /**
     * @param string[] $surfaces
     */
    public function changeVisualPreference(
        array $surfaces,
        string $mode,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ([] === $surfaces) {
            throw ChangeMyVisualPreferenceException::noSurfaces();
        }

        if (!in_array(needle: $mode, haystack: self::getValidVisualModes(), strict: true)) {
            throw ChangeMyVisualPreferenceException::invalidMode(mode: $mode);
        }

        foreach ($surfaces as $surface) {
            if (!is_string(value: $surface)) {
                throw ChangeMyVisualPreferenceException::invalidSurface(surface: get_debug_type(value: $surface));
            }

            if (!in_array(needle: $surface, haystack: self::VISUAL_SURFACES, strict: true)) {
                throw ChangeMyVisualPreferenceException::invalidSurface(surface: $surface);
            }
        }

        $now = $dateTimeGenerator->now();

        $this->visualPreferences = array_merge(
            $this->resolvedVisualPreferences(),
            array_fill_keys(keys: $surfaces, value: $mode),
        );
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new MyVisualPreferenceChanged(
                aggregateId: $this->id,
                occurredOn: $now,
                surfaces: array_values($surfaces),
                mode: $mode,
                username: $this->username,
                tenantId: $this->tenantId,
                email: $this->email,
                name: $this->name,
                lastname: $this->lastname,
                role: $this->role,
                roles: $this->roles,
                isActive: $this->isActive,
                emailVerified: $this->emailVerified,
                theme: $this->theme,
                visualPreferences: $this->visualPreferences,
                createdAt: $this->createdAt,
                updatedAt: $this->updatedAt,
                createdByUserId: $this->createdByUserId,
                updatedByUserId: $this->updatedByUserId,
            )
        );
    }

    /**
     * @return array<string, string>
     */
    public function resolvedVisualPreferences(): array
    {
        return self::resolveVisualPreferences(stored: $this->visualPreferences ?? []);
    }

    /**
     * @param array<string, mixed> $stored
     *
     * @return array<string, string>
     */
    public static function resolveVisualPreferences(array $stored): array
    {
        $resolved = [];

        foreach (self::VISUAL_SURFACES as $surface) {
            $mode = $stored[$surface] ?? null;
            $resolved[$surface] = in_array(needle: $mode, haystack: self::getValidVisualModes(), strict: true)
                ? $mode
                : self::VISUAL_MODE_IMAGE;
        }

        return $resolved;
    }

    public static function getValidThemes(): array
    {
        return [self::THEME_LIGHT, self::THEME_DARK];
    }

    /**
     * @return string[]
     */
    public static function getValidVisualModes(): array
    {
        return [self::VISUAL_MODE_IMAGE, self::VISUAL_MODE_ICON];
    }
}
