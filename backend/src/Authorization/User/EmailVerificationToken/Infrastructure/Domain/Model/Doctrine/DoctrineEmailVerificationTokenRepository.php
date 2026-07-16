<?php

namespace Authorization\User\EmailVerificationToken\Infrastructure\Domain\Model\Doctrine;

use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationToken;
use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationTokenRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineEmailVerificationTokenRepository extends EntityRepository implements EmailVerificationTokenRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByHash(string $tokenHash): ?EmailVerificationToken
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('token')
            ->from(from: EmailVerificationToken::class, alias: 'token')
            ->where('token.tokenHash = :tokenHash')
            ->setParameter(key: 'tokenHash', value: $tokenHash)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(EmailVerificationToken $token): void
    {
        $this->getEntityManager()->persist(object: $token);
    }
}
