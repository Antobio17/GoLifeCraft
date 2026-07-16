<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\Domain\Model\Doctrine;

use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetToken;
use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetTokenRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrinePasswordResetTokenRepository extends EntityRepository implements PasswordResetTokenRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByHash(string $tokenHash): ?PasswordResetToken
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('token')
            ->from(from: PasswordResetToken::class, alias: 'token')
            ->where('token.tokenHash = :tokenHash')
            ->setParameter(key: 'tokenHash', value: $tokenHash)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(PasswordResetToken $token): void
    {
        $this->getEntityManager()->persist(object: $token);
    }
}
