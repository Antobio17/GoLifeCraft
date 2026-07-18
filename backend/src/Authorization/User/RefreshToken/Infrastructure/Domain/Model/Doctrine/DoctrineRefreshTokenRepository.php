<?php

namespace Authorization\User\RefreshToken\Infrastructure\Domain\Model\Doctrine;

use Authorization\User\RefreshToken\Domain\Model\RefreshToken;
use Authorization\User\RefreshToken\Domain\Model\RefreshTokenRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineRefreshTokenRepository extends EntityRepository implements RefreshTokenRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByHash(string $tokenHash): ?RefreshToken
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('token')
            ->from(from: RefreshToken::class, alias: 'token')
            ->where('token.tokenHash = :tokenHash')
            ->setParameter(key: 'tokenHash', value: $tokenHash)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(RefreshToken $token): void
    {
        $this->getEntityManager()->persist(object: $token);
        $this->getEntityManager()->flush();
    }
}
