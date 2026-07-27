<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\Model\Doctrine;

use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineAgendaEntryRepository extends EntityRepository implements AgendaEntryRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?AgendaEntry
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('agendaEntry')
            ->from(from: AgendaEntry::class, alias: 'agendaEntry')
            ->where('agendaEntry.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findBySeriesId(string $seriesId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('agendaEntry')
            ->from(from: AgendaEntry::class, alias: 'agendaEntry')
            ->where('agendaEntry.seriesId = :seriesId')
            ->setParameter(key: 'seriesId', value: $seriesId)
            ->orderBy('agendaEntry.entryDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(AgendaEntry $agendaEntry): void
    {
        $this->getEntityManager()->persist(object: $agendaEntry);
    }

    public function delete(AgendaEntry $agendaEntry): void
    {
        $this->getEntityManager()->remove(object: $agendaEntry);
    }
}
