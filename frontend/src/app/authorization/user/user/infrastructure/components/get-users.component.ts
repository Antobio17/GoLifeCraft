import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SkeletonPageHeaderComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-page-header.component";
import { GetUsersService } from "@authorization/user/user/application/services/get-users.service";
import { DeleteUserService } from "@authorization/user/user/application/services/delete-user.service";
import { GetUsersResponse } from "@authorization/user/user/domain/models/get-users-response.model";
import { User } from "../../domain/models/user.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { PaginationComponent } from "@shared/shared/pagination/infrastructure/components/pagination.component";
import { ListTableComponent } from "@shared/shared/list-table/infrastructure/components/list-table.component";
import {
  ListAction,
  ListActionEvent,
  ListColumn,
} from "@shared/shared/list-table/domain/models/list-table.model";
import { ListFiltersComponent } from "@shared/shared/list-filters/infrastructure/components/list-filters.component";
import { FilterField } from "@shared/shared/list-filters/domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { ConfirmActionModalComponent } from "@shared/shared/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/shared/page-header/infrastructure/components/page-header.component";

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
export class GetUsersComponent implements OnInit {
  private getUsersService = inject(GetUsersService);
  private deleteUserService = inject(DeleteUserService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "authorization/user/user";

  users = signal<User[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(20);
  totalUsers = signal(0);
  totalPages = computed(() => Math.ceil(this.totalUsers() / this.pageSize()));

  filterUsername = "";
  filterEmail = "";
  filterRole = "";

  filterFields: FilterField[] = [];

  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);

  columns: ListColumn<User>[] = [];

  actions: ListAction[] = [];

  private readonly PAGE_SIZE_KEY = "pageSize_users";

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.currentPage.set(parseInt(params.get("page") || "1", 10));
    const savedPageSize = localStorage.getItem(this.PAGE_SIZE_KEY) ?? "20";
    this.pageSize.set(parseInt(params.get("pageSize") || savedPageSize, 10));

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
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
              {
                value: USER_ROLES.GOD,
                label: "user.roles.god",
                color: "#7c3aed",
              },
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
            value: (user) =>
              `${user.attributes.name} ${user.attributes.lastname}`,
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
            value: (user) => this.getRoleDisplayName(user.attributes.role),
            badge: (user) => this.getRoleBadgeClass(user.attributes.role),
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

        this.loadUsers();
      });
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage(), pageSize: this.pageSize() },
      replaceUrl: true,
    });
  }

  loadUsers(): void {
    this.loading.set(true);

    this.getUsersService
      .getUsers(
        this.currentPage(),
        this.pageSize(),
        this.filterUsername || undefined,
        this.filterEmail || undefined,
        this.filterRole || undefined,
      )
      .subscribe({
        next: (response: GetUsersResponse) => {
          this.users.set(response.data);
          this.totalUsers.set(response.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updateQueryParams();
    this.loadUsers();
  }

  nextPage(): void {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update((p) => p + 1);
    this.updateQueryParams();
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.updateQueryParams();
    this.loadUsers();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case USER_ROLES.GOD:
        return "badge-god";
      default:
        return "badge-user";
    }
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      [USER_ROLES.GOD]: "user.roles.god",
      [USER_ROLES.USER]: "user.roles.user",
    };
    return roleNames[role] || role;
  }

  onEditUser(userId: string): void {
    this.router.navigate(["/users", userId, "edit"]);
  }

  onCreateUser(): void {
    this.router.navigate(["/users", "create"]);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    localStorage.setItem(this.PAGE_SIZE_KEY, String(newSize));
    this.updateQueryParams();
    this.loadUsers();
  }

  onFiltersApplied(values: Record<string, any>): void {
    this.filterUsername = values["username"] || "";
    this.filterEmail = values["email"] || "";
    this.filterRole = values["role"] || "";
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFiltersCleared(): void {
    this.filterUsername = "";
    this.filterEmail = "";
    this.filterRole = "";
    this.currentPage.set(1);
    this.loadUsers();
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
        this.loadUsers();
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
