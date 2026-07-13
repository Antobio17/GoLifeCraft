import { Component, inject, signal } from "@angular/core";
import { Observable } from "rxjs";
import { SkeletonPageHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-page-header.component";
import { GetUsersService } from "@authorization/user/user/application/services/get-users.service";
import { DeleteUserService } from "@authorization/user/user/application/services/delete-user.service";
import { User } from "../../domain/models/user.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import {
  getRoleBadgeClass,
  getRoleLabelKey,
} from "@authorization/domain/utils/role.utils";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { PaginationComponent } from "@shared/design-system/pagination/infrastructure/components/pagination.component";
import { ListTableComponent } from "@shared/design-system/list-table/infrastructure/components/list-table.component";
import {
  ListAction,
  ListActionEvent,
  ListColumn,
} from "@shared/design-system/list-table/domain/models/list-table.model";
import { ListFiltersComponent } from "@shared/design-system/list-filters/infrastructure/components/list-filters.component";
import { FilterField } from "@shared/design-system/list-filters/domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/design-system/page-header/infrastructure/components/page-header.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-users",
  templateUrl: "./get-users.component.html",
  imports: [
    PaginationComponent,
    ListTableComponent,
    ListFiltersComponent,
    ContextualTranslatePipe,
    ConfirmActionModalComponent,
    ButtonComponent,
    SkeletonPageHeaderComponent,
    PageWrapperComponent,
    PageHeaderComponent,
  ],
})
export class GetUsersComponent extends AbstractListPageComponent<User> {
  private getUsersService = inject(GetUsersService);
  private deleteUserService = inject(DeleteUserService);
  private floatingToastService = inject(FloatingToastService);

  protected readonly modulePath = "authorization/user/user";
  protected readonly storageKey = "pageSize_users";

  filterUsername = "";
  filterRole = "";
  filterFields: FilterField[] = [];
  columns: ListColumn<User>[] = [];
  actions: ListAction<User>[] = [];

  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);

  protected configureList(): void {
    this.filterFields = [
      {
        key: "username",
        label: this.t("getUsers.filter.username"),
        type: "text",
        placeholder: this.t("getUsers.filter.usernamePlaceholder"),
      },
      {
        key: "role",
        label: this.t("getUsers.filter.role"),
        type: "chips",
        options: [
          { value: USER_ROLES.GOD, label: "user.roles.god", color: "#7c3aed" },
          {
            value: USER_ROLES.USER,
            label: "user.roles.user",
            color: "#16a34a",
          },
        ],
      },
    ];

    this.columns = [
      {
        key: "name",
        label: this.t("getUsers.table.name"),
        value: (user) => `${user.attributes.name} ${user.attributes.lastname}`,
        width: "2fr",
        minWidth: "180px",
        cardPrimary: true,
      },
      {
        key: "username",
        label: this.t("getUsers.table.username"),
        value: (user) => user.attributes.username,
        width: "1.5fr",
        minWidth: "150px",
        cardLabel: this.t("getUsers.table.username"),
      },
      {
        key: "role",
        label: this.t("getUsers.table.role"),
        value: (user) => getRoleLabelKey(user.attributes.role),
        badge: (user) => getRoleBadgeClass(user.attributes.role),
        translate: true,
        width: "1.5fr",
        minWidth: "160px",
      },
      {
        key: "isActive",
        label: this.t("getUsers.table.status"),
        value: (user) =>
          user.attributes.isActive
            ? this.t("getUsers.table.active")
            : this.t("getUsers.table.inactive"),
        badge: (user) =>
          user.attributes.isActive ? "status-active" : "status-inactive",
        width: "1fr",
        minWidth: "110px",
      },
      {
        key: "createdAt",
        label: this.t("getUsers.table.createdAt"),
        value: (user) => user.attributes.createdAt,
        format: "date",
        cardLabel: this.t("getUsers.table.createdLabel"),
        width: "1.5fr",
        minWidth: "130px",
      },
    ];

    this.actions = [
      {
        key: "edit",
        label: this.t("getUsers.actions.edit"),
        icon: "edit",
        visible: (user: User) => user.attributes.role !== USER_ROLES.GOD,
      },
      {
        key: "delete",
        label: this.t("getUsers.actions.delete"),
        icon: "delete",
        danger: true,
        visible: (user: User) => user.attributes.role !== USER_ROLES.GOD,
      },
    ];
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<User>> {
    return this.getUsersService.getUsers(
      page,
      pageSize,
      this.filterUsername || undefined,
      undefined,
      this.filterRole || undefined,
    );
  }

  protected override applyFilters(
    values: Record<string, string | boolean>,
  ): void {
    this.filterUsername = (values["username"] as string) || "";
    this.filterRole = (values["role"] as string) || "";
  }

  protected override clearFilters(): void {
    this.filterUsername = "";
    this.filterRole = "";
  }

  onCreateUser(): void {
    this.router.navigate(["/users", "create"]);
  }

  onEditUser(userId: string): void {
    this.router.navigate(["/users", userId, "edit"]);
  }

  onAction({ key, row }: ListActionEvent<User>): void {
    if (key === "edit") this.onEditUser(row.id);
    if (key === "delete") this.onDeleteUser(row);
  }

  onDeleteUser(user: User): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    if (!this.userToDelete()) return;

    this.isDeleting.set(true);
    this.deleteUserService.deleteUser(this.userToDelete()!.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "user.delete.success",
          details: [],
        });
        this.load();
      },
      error: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
      },
    });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }
}
