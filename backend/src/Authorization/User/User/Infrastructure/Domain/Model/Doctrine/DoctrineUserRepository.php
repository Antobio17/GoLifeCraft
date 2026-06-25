<?php

namespace Authorization\User\User\Infrastructure\Domain\Model\Doctrine;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineUserRepository extends EntityRepository implements UserRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByUsername(string $username): ?User
    {
        $user = $this->getEntityManager()->createQueryBuilder()
            ->select('user')
            ->from(from: User::class, alias: 'user')
            ->where('user.username = :username')
            ->setParameter(key: 'username', value: $username)
            ->getQuery()
            ->getOneOrNullResult();

        return $user;
    }

    public function findById(string $id): ?User
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('user')
            ->from(from: User::class, alias: 'user')
            ->where('user.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(User $user): void
    {
        $this->getEntityManager()->persist(object: $user);
    }

    public function delete(User $user): void
    {
        $this->getEntityManager()->remove(object: $user);
    }
}
