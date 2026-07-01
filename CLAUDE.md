# CLAUDE.md — Guía de desarrollo del monorepo

## Estructura del monorepo

```
GoLifeCraft/
├── backend/    # API Symfony (PHP)
├── frontend/   # Aplicación Angular
└── docs/       # Documentación y tickets
```

---

## Reglas generales (aplican a todo el monorepo)

- **Nunca anidar `if`.** Usar siempre cláusulas de guarda: validar al inicio y retornar/lanzar anticipadamente.
- **Nunca añadir comentarios de código explicativos.** El código debe ser autoexplicativo.
- **No usar `setTimeout` en componentes.** Usar el operador `delay` de RxJS cuando se necesite diferir navegación u otras acciones.

---

# BACKEND (Symfony)

## Stack

- **PHP 8.3+**, **Symfony 6.4**
- **Doctrine ORM 3.x** con mapeo XML, dos entity managers (`master_manager`, `tenant_manager`)
- **Symfony Messenger** como bus único de comandos y queries (CQRS)
- **JWT** con `lexik/jwt-authentication-bundle`
- **UUID v4** con `ramsey/uuid` para IDs
- **PHPUnit 11**, **PHP-CS-Fixer**
- **Multi-tenancy**: base de datos `master` (usuarios) + bases de datos por tenant (negocio)
- **MCP Server** (Model Context Protocol) para exponer modelos del negocio a clientes MCP, con flujo OAuth 2.0 propio en un módulo aparte (`Integration/Mcp/OAuth`)

## Bounded contexts reales

```
src/
├── Authorization/User/User/        # Usuarios, login JWT, perfil, cambio de contraseña
├── Integration/Mcp/Server/         # Servidor MCP genérico (describe/query/write de modelos)
├── Integration/Mcp/OAuth/          # OAuth 2.0 propio del MCP (authorize/token/.well-known + autenticación de tokens)
├── Nutrition/Catalog/              # Negocio: Product, Format, NutritionFacts
└── Shared/                         # Shared/Shared, Shared/DomainEventLog, Tenant/Tenant, Tool/Tool
```

> Los ejemplos `Foo`/`Centers` de esta guía son **plantillas ilustrativas**, no entidades reales. Para ver un módulo completo de referencia, mirar `Authorization/User/User`.

## Comandos — ejecutar dentro del contenedor Docker

Antes de dar por terminado cualquier desarrollo:
```bash
php bin/console doctrine:schema:update --force --dump-sql --em=tenant_manager
php bin/console doctrine:schema:update --force --dump-sql
php bin/phpunit
./vendor/bin/php-cs-fixer fix src/
```

## Criterio de validación: Dominio vs Aplicación

- **¿La regla depende solo del estado de la entidad?** → Dominio (`create`/`update` del aggregate).
- **¿La regla garantiza que el objeto no sea inválido?** → Dominio.
- **¿La regla depende del contexto de quién ejecuta (roles, permisos, sesión)?** → Aplicación (CommandHandler o NeedleDataQuery).

## Arquitectura: DDD + Hexagonal + CQRS

```
src/{BoundedContext}/{SubContext}/{Module}/
├── Application/
│   ├── Command/
│   │   ├── {Action}Command.php
│   │   └── {Action}CommandHandler.php
│   ├── Query/
│   │   ├── {Action}Query.php
│   │   ├── {Action}QueryHandler.php
│   │   └── {Action}DataTransform.php         ← interfaz
│   └── Subscriber/
│       └── {Verb}{Entity}On{Event}.php
├── Domain/
│   ├── Model/
│   │   ├── {Entity}.php                       ← extends Aggregate
│   │   └── {Entity}Repository.php             ← interfaz
│   ├── QueryModel/
│   │   ├── {Action}NeedleDataQuery.php        ← interfaz de lectura
│   │   └── Dto/
│   │       └── Get{Entity}Result.php          ← extends QueryAggregateResult
│   ├── Event/
│   │   └── {Entity}{Verb}ed.php               ← extends DomainEvent
│   ├── Exception/
│   │   └── {Action}{Entity}Exception.php      ← extends BaseException
│   └── Service/
│       └── {ServiceName}.php                  ← interfaz
└── Infrastructure/
    ├── Application/
    │   ├── command_handlers.yaml
    │   ├── query_handlers.yaml
    │   └── subscribers.yaml
    ├── Domain/
    │   ├── Model/
    │   │   ├── Doctrine/
    │   │   │   ├── Doctrine{Entity}Repository.php
    │   │   │   └── Mapping/{Entity}.orm.xml
    │   │   ├── InMemory/
    │   │   │   └── InMemory{Entity}Repository.php
    │   │   └── repositories.yaml
    │   ├── QueryModel/
    │   │   ├── Doctrine/
    │   │   │   └── Doctrine{Action}NeedleDataQuery.php
    │   │   ├── InMemory/
    │   │   │   └── InMemory{Action}NeedleDataQuery.php
    │   │   └── queries.yaml
    │   └── Service/
    │       ├── {Impl}/{ConcreteService}.php
    │       └── services.yaml
    └── UI/
        └── API/
            ├── Controller/
            │   └── {Action}{Entity}Controller.php
            ├── DataTransform/
            │   └── Api{Action}DataTransform.php
            ├── controllers.yaml
            └── routes.yaml
```

## Patrones de implementación

### Command

```php
final readonly class CreateFooCommand implements Command
{
    public function __construct(
        public string $name,
        public string $createdByUserId,
    ) {}

    public static function getName(): string
    {
        return 'golifecraft.{boundedContext}.command.1.{entity}.{action}';
    }
}
```

### Command Handler

```php
final readonly class CreateFooCommandHandler
{
    public function __construct(
        private FooRepository $fooRepository,
        private CreateFooNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {}

    public function __invoke(CreateFooCommand $command): void
    {
        if ($this->needleDataQuery->alreadyExists(name: $command->name)) {
            throw CreateFooException::alreadyExists(name: $command->name);
        }

        $foo = Foo::create(
            id: $this->fooRepository->nextId(),
            name: $command->name,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->fooRepository->save(foo: $foo);
        $this->domainEventCollectorService->register(aggregate: $foo);
    }
}
```

> El handler no implementa ninguna interfaz. Symfony Messenger lo detecta por el tag `messenger.message_handler` en YAML.

### Aggregate

```php
class Foo extends Aggregate
{
    private int $version;

    public function __construct(
        public readonly string $id,
        public string $name,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
    ) {}

    public static function create(
        string $id,
        string $name,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();
        $foo = new self(
            id: $id,
            name: $name,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        );

        $foo->record(event: new FooCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
        ));

        return $foo;
    }
}
```

### Controller

```php
final class CreateFooController
{
    use HandleTrait;

    public function __construct(MessageBusInterface $messageBus)
    {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new CreateFooCommand(
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                status: Response::HTTP_INTERNAL_SERVER_ERROR
            );
        } catch (ArgumentRequestException|CreateFooException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
```

### Domain Event

```php
final readonly class FooCreated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.{boundedContext}.event.1.{entity}.created';
    }
}
```

### Domain Exception

```php
final class CreateFooException extends BaseException
{
    public static function alreadyExists(string $name): self
    {
        return new static(
            title: 'Foo already exists.',
            keyTranslation: 'foo.already.exists',
            details: ['name' => $name]
        );
    }
}
```

## Registros YAML clave

### `command_handlers.yaml`
```yaml
services:
  Foo\Bar\Baz\Application\Command\CreateFooCommandHandler:
    class: Foo\Bar\Baz\Application\Command\CreateFooCommandHandler
    arguments:
      $fooRepository: '@Foo\Bar\Baz\Domain\Model\FooRepository'
      $needleDataQuery: '@Foo\Bar\Baz\Domain\QueryModel\CreateFooNeedleDataQuery'
      $domainEventCollectorService: '@Shared\Shared\Shared\Domain\Service\DomainEventCollectorService'
      $dateTimeGenerator: '@Shared\Tool\Tool\Domain\Service\DateTimeGenerator'
    tags:
      - { name: 'messenger.message_handler', bus: 'messenger.bus.default' }
```

### `repositories.yaml`
```yaml
services:
  Foo\Bar\Baz\Domain\Model\FooRepository:
    class: Foo\Bar\Baz\Infrastructure\Domain\Model\Doctrine\DoctrineFooRepository
    factory: ["@doctrine.orm.tenant_entity_manager", getRepository]
    arguments:
      - Foo\Bar\Baz\Domain\Model\Foo
```

> `@doctrine.orm.entity_manager` para master, `@doctrine.orm.tenant_entity_manager` para tenant.
> `@doctrine.dbal.master_connection` o `@doctrine.dbal.writer_tenant_connection` para DBAL.

## Mapping Doctrine XML

```xml
<entity repository-class="..." name="Foo\Bar\Baz\Domain\Model\Foo" table="foo">
  <id name="id" type="string" column="id" primary="true" length="36"/>
  <field name="version" type="integer" version="true"/>
  <field name="name" type="string" column="name" length="255"/>
  <field name="createdAt" type="datetime" column="created_at"/>
  <field name="updatedAt" type="datetime" column="updated_at"/>
  <field name="createdByUserId" type="string" column="created_by_user_id" length="36"/>
  <field name="updatedByUserId" type="string" column="updated_by_user_id" length="36"/>
</entity>
```

> Siempre incluir `version` para optimistic locking.

## Tests unitarios

- Usar implementaciones `InMemory*` para repository y NeedleDataQuery.
- Cablear todo manualmente en `setUp()`.
- Invocar handler con `($this->handler)($command)`.
- Usar named arguments en todas las instanciaciones.

```php
final class CreateFooCommandHandlerTest extends TestCase
{
    private CreateFooCommandHandler $handler;

    protected function setUp(): void
    {
        $repository = new InMemoryFooRepository();
        $this->handler = new CreateFooCommandHandler(
            fooRepository: $repository,
            needleDataQuery: new InMemoryCreateFooNeedleDataQuery(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesFooSuccessfully(): void
    {
        ($this->handler)(new CreateFooCommand(name: 'test', createdByUserId: 'user-1'));

        // asserts...
    }
}
```

## Multi-tenancy

- `master_manager`: gestiona los `User` (autenticación, roles).
- `tenant_manager`: gestiona el negocio, se resuelve por request via `TenantResolverSubscriber`.
- `tenantId`, `userSessionId`, `userRole` se inyectan en `$request->attributes` vía `RequestExtractor`.

## MCP Server (`Integration/Mcp/Server`)

Bounded context genérico que expone entidades del negocio a clientes MCP. No se escribe código por entidad: cada modelo expuesto se declara de forma declarativa.

- **Registro de recursos**: `config/packages/mcp_resources.yaml` mapea cada recurso a su clase de dominio, su sidecar y los roles de lectura/escritura (`read_roles`, `write_roles`).
- **Sidecar `{Entity}.mcp.yaml`**: junto al mapping Doctrine de la entidad (`Infrastructure/Domain/Model/Doctrine/Mapping/`). Declara `label`, `fields` (con `writable`, `required`, `type`, `min`/`max`, `enum`, `regex`, `unique`, `filterable`, `sortable`) y `relations` (`target`, `kind`, `writable`, `expandable`).
- **Operaciones**: `DescribeModelsQuery`, `QueryModelQuery` y `WriteModelCommand` operan de forma genérica sobre cualquier recurso registrado, validando contra el sidecar y los roles.

> Para exponer una entidad nueva por MCP: crear su `{Entity}.mcp.yaml` y registrarla en `mcp_resources.yaml`. No requiere Command/Query/Controller propios.

## MCP OAuth (`Integration/Mcp/OAuth`)

Bounded context que implementa el flujo OAuth 2.0 propio del MCP y la autenticación de los tokens emitidos. Está separado del `Server`: el `Server` expone los modelos, el `OAuth` protege el acceso.

- **Authorization Code Flow + PKCE (S256)**: `/oauth/authorize`, `/oauth/token`, `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server` (controllers en `Infrastructure/UI/API`).
- **`AuthorizationCodeStore`** (`Infrastructure/Domain/Service`): persiste los códigos de autorización en `cache.app` con TTL.
- **Resource server**: `McpTokenAuthenticator` + `McpAuthenticationEntryPoint` (`Infrastructure/Domain/Service/Security`) autentican los Bearer tokens del firewall `mcp` (rutas `^/_mcp`), registrados en `config/packages/security.yaml`.

## Helpers disponibles

| Clase | Uso |
|---|---|
| `RequestExtractor` | Extraer valores del request (body JSON/form, query params, filtros, paginación) |
| `JsonResponseBuilder` | Construir respuestas JSON-API (single, collection, error) |
| `DateTimeGenerator` | Obtener `\DateTime` actual de forma inyectable |
| `DomainEventCollectorService` | Registrar aggregates para que el middleware publique sus eventos |
| `BaseException` | Clase base para excepciones de dominio con `title`, `keyTranslation`, `details` |

## Convenciones de nombrado

| Elemento | Patrón |
|---|---|
| Command name | `golifecraft.{context}.command.1.{entity}.{action}` |
| Event name | `golifecraft.{context}.event.1.{entity}.{verb}ed` |
| Ruta API | `/api/v1/{context}/{entity}` |
| Tabla DB | `snake_case` |
| Columna DB | `snake_case` |

## Checklist backend — nuevo caso de uso

- [ ] `{Action}Command` o `{Action}Query`
- [ ] `{Action}CommandHandler` o `{Action}QueryHandler`
- [ ] Si es query: interfaz `{Action}DataTransform` + `{Entity}Result` DTO
- [ ] Interfaz `{Action}NeedleDataQuery` (si se necesita)
- [ ] `Doctrine*` e `InMemory*` del NeedleDataQuery
- [ ] `{Action}{Entity}Controller`
- [ ] Registrar en los YAML correspondientes (`command_handlers`, `query_handlers`, `queries`, `controllers`, `routes`)
- [ ] Tests unitarios con InMemory

---

# FRONTEND (Angular)

## Stack

- **Angular 18+** (Standalone components, signals opcionales)
- **RxJS** para flujos asíncronos
- **Angular Reactive Forms**
- Arquitectura **Hexagonal + DDD** en frontend

## Comandos

```bash
# Desarrollo
ng serve --proxy-config proxy.conf.json

# Linting y formato
npx ng lint --fix
npx prettier --write "src/**/*.{ts,html,scss,css,json}"

# Limpiar caché si hay errores de compilación
rm -rf node_modules/.cache dist .angular && npx ng cache clean
```

## Arquitectura: Hexagonal en Angular

```
src/app/{boundedContext}/{subContext}/{module}/
├── domain/
│   ├── models/
│   │   └── {action}.model.ts          ← interfaces de request/response
│   ├── ports/
│   │   └── {action}.port.ts           ← abstract class (puerto)
│   └── guards/                        ← (opcional) CanActivateFn (auth.guard, role.guard)
├── application/
│   └── services/
│       └── {action}.service.ts        ← orquesta el caso de uso via el puerto
└── infrastructure/
    ├── adapters/
    │   └── http-{action}.adapter.ts   ← implementación HTTP del puerto
    ├── components/
    │   └── {action}.component.ts      ← componente UI standalone
    ├── providers/
    │   └── {action}.provider.ts       ← wiring de DI
    ├── routes/
    │   └── {module}.routes.ts         ← rutas lazy del módulo (cargadas desde app.routes.ts)
    └── translations/                  ← (opcional) en.json / es.json del módulo
```

> La estructura real de directorios es `{boundedContext}/{subContext}/{module}` (p. ej. `authorization/user/user`, `authorization/login/login`). Componentes UI compartidos viven en `shared/shared/*`; la sesión/auth (signals) en `shared/auth`.

## Patrones de implementación

### Port (dominio)

```typescript
export abstract class GetCentersPort {
  abstract getCenters(
    page: number,
    pageSize: number,
    filterName?: string,
  ): Observable<GetCentersResponse>;
}
```

### Model (dominio)

```typescript
export interface GetCentersResponse {
  meta: { pageNumber: number; pageSize: number; total: number };
  data: Center[];
}

export interface GetCentersRequest {
  page: number;
  pageSize: number;
  filterName?: string;
}
```

### Service (aplicación)

```typescript
export class GetCentersService {
  private getCentersPort = inject(GetCentersPort);

  getCenters(page: number = 1, pageSize: number = 10, filterName?: string): Observable<GetCentersResponse> {
    return this.getCentersPort.getCenters(page, pageSize, filterName);
  }
}
```

### HTTP Adapter (infraestructura)

```typescript
@Injectable()
export class HttpGetCentersAdapter implements GetCentersPort {
  private http = inject(HttpClient);

  getCenters(page: number, pageSize: number, filterName?: string): Observable<GetCentersResponse> {
    let params = new HttpParams()
      .set('page[number]', page.toString())
      .set('page[size]', pageSize.toString());

    if (filterName) {
      params = params.set('filter[name]', filterName);
    }

    return this.http.get<GetCentersResponse>('/api/v1/organization/centers', { params });
  }
}
```

> **No establecer el header `Authorization` manualmente en los adaptadores.** El interceptor `auth-token.interceptor.ts` lo gestiona automáticamente para todas las peticiones.

### Provider (wiring DI)

```typescript
export class GetCentersProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetCentersPort, useClass: HttpGetCentersAdapter },
      {
        provide: GetCentersService,
        useFactory: (port: GetCentersPort) => new GetCentersService(port),
        deps: [GetCentersPort],
      },
    ];
  }
}
```

### Component (infraestructura)

```typescript
@Component({
  selector: 'app-create-center',
  templateUrl: './create-center.component.html',
  imports: [FormsModule, ReactiveFormsModule],
})
export class CreateCenterComponent {
  private createCenterService = inject(CreateCenterService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  centerForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  saving = false;

  onSubmit(): void {
    if (this.centerForm.invalid) {
      Object.keys(this.centerForm.controls).forEach((key) =>
        this.centerForm.controls[key].markAsTouched()
      );
      return;
    }

    this.saving = true;

    this.createCenterService.createCenter(this.centerForm.value).pipe(
      delay(900),
    ).subscribe({
      next: () => {
        this.saving = false;
        this.floatingToastService.showToast({ status: 200, title: 'Centro creado correctamente', keyTranslation: 'center.create.success', details: [] });
        this.router.navigate(['/centers']);
      },
      error: () => { this.saving = false; },
    });
  }
}
```

## Reglas específicas del frontend

- **Usar siempre `inject()`** en lugar de constructor injection (componentes y servicios).
- **No leer `localStorage` directamente en adaptadores.** El interceptor `auth-token.interceptor.ts` añade el token a todas las peticiones HTTP automáticamente.
- **No usar `setTimeout` para diferir navegación.** Usar el operador `delay()` de RxJS en el pipeline del observable.
- **Componentes standalone** (`imports: [...]` en el decorador, sin NgModule).
- **Un provider por caso de uso**, registrado en el componente o ruta que lo necesite.

## Sistema de roles

Solo existen dos roles (ver `User::ROLE_HERARCHY` en backend y `USER_ROLES` en `authorization/domain/constants/user-roles.constants.ts`):

| Rol | Alcance |
|---|---|
| `ROLE_GOD` | Acceso total (lectura y escritura). |
| `ROLE_USER` | Usuario de solo lectura. El guard `blockReadOnlyUserGuard` lo bloquea en rutas de escritura. |

## Checklist frontend — nuevo caso de uso

- [ ] Interface/model en `domain/models/`
- [ ] Abstract class port en `domain/ports/`
- [ ] Service en `application/services/`
- [ ] HTTP Adapter en `infrastructure/adapters/`
- [ ] Component standalone en `infrastructure/components/`
- [ ] Provider en `infrastructure/providers/`
- [ ] Registrar provider en el componente/ruta correspondiente
- [ ] Rutas lazy en `infrastructure/routes/{module}.routes.ts` y enganchadas en `app.routes.ts`
- [ ] Traducciones en `infrastructure/translations/` (en/es) si el módulo tiene textos propios
