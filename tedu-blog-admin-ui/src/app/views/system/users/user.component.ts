import { Helper } from './../../../shared/ultilities/helper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, SortEvent } from 'primeng/api';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { Subject, map, takeUntil } from 'rxjs';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { RoleAssignComponent } from './role-assign/role-assign.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { AdminApiUserApiClient, UserDto, UserDtoPagedResult } from 'src/app/api/admin-api.service.generated';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MessageConstants } from 'src/app/shared/constants/messages.constant';
import { Table } from 'primeng/table';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Paginator } from 'primeng/paginator';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
})
export class UserComponent implements OnDestroy {
    //System variables
    private ngUnsubscribe = new Subject<void>();
    public blockedPanel: boolean = false;

    //Paging variables
    public pageIndex: number = 1;
    public pageSize: number = 10;
    public totalCount: number;
    public sortField = null;
    public sortOrder = -1;

    //Business variables
    public items: UserDto[];
    public selectedItems: UserDto[] = [];
    public keyword: string = '';

    @ViewChild('dt', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    
    sizes!: any[];

    constructor(
        private userService: AdminApiUserApiClient,
        public dialogService: DialogService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private utilityService: UtilityService
    ) {}

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onLazyLoad($event) {
        this.pageIndex = ($event.first / this.pageSize) + 1;
        this.sortField = $event.sortField;
        this.sortOrder = $event.sortOrder;
        this.pageSize = $event.rows;
        this.paginator.changePage(this.pageIndex - 1);
        this.loadData();
    }

    loadData(selectionId = null) {
        this.toggleBlockUI(true);
        this.userService
            .getAllUsersPaging(this.sortField, this.sortOrder, this.keyword, this.pageIndex, this.pageSize)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (response: UserDtoPagedResult) => {
                    this.items = response.results;
                    this.totalCount = response.rowCount;
                    if (selectionId != null && this.items.length > 0) {
                        this.selectedItems = this.items.filter(
                            (x) => x.id == selectionId
                        );
                    }
                    this.toggleBlockUI(false);
                },
                error: () => {
                    this.toggleBlockUI(false);
                },
            });
    }

    showAddModal() {
        const ref = this.dialogService.open(UserDetailComponent, {
            header: 'Thêm mới người dùng',
            width: '70%',
        });
        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
        const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
        dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
        ref.onClose.subscribe((data: UserDto) => {
            if (data) {
                this.alertService.showSuccess(
                    MessageConstants.CREATED_OK_MSG
                );
                this.selectedItems = [];
                this.loadData();
            }
        });
    }

    showEditModal() {
        if (this.selectedItems.length == 0) {
            this.alertService.showError(
                MessageConstants.NOT_CHOOSE_ANY_RECORD
            );
            return;
        }
        var id = this.selectedItems[0].id;
        const ref = this.dialogService.open(UserDetailComponent, {
            data: {
                id: id,
            },
            header: 'Cập nhật người dùng',
            width: '70%',
        });
        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
        const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
        dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
        ref.onClose.subscribe((data: UserDto) => {
            if (data) {
                this.alertService.showSuccess(
                    MessageConstants.UPDATED_OK_MSG
                );
                this.selectedItems = [];
                this.loadData(data.id);
            }
        });
    }

    deleteItems() {
        if (this.selectedItems.length == 0) {
            this.alertService.showError(
                MessageConstants.NOT_CHOOSE_ANY_RECORD
            );
            return;
        }
        var ids = [];
        this.selectedItems.forEach((element) => {
            ids.push(element.id);
        });
        this.confirmationService.confirm({
            message: MessageConstants.CONFIRM_DELETE_MSG,
            accept: () => {
                this.deleteItemsConfirm(ids);
            },
        });
    }

    deleteItemsConfirm(ids: any[]) {
        this.toggleBlockUI(true);
        this.userService.deleteUsers(ids).subscribe({
            next: () => {
                this.alertService.showSuccess(
                    MessageConstants.DELETED_OK_MSG
                );
                this.loadData();
                this.selectedItems = [];
                this.toggleBlockUI(false);
            },
            error: () => {
                this.toggleBlockUI(false);
            },
        });
    }

    onSetPassword(id: string) {
        const ref = this.dialogService.open(SetPasswordComponent, {
            data: {
                id: id,
            },
            header: 'Đặt lại mật khẩu',
            width: '70%',
        });
        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
        const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
        dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
        ref.onClose.subscribe((result: boolean) => {
            if (result) {
                this.alertService.showSuccess(
                    MessageConstants.CHANGE_PASSWORD_SUCCCESS_MSG
                );
                this.selectedItems = [];
                this.loadData();
            }
        });
    }

    onChangeEmail(id: string) {
        const ref = this.dialogService.open(ChangeEmailComponent, {
            data: {
                id: id,
            },
            header: 'Đặt lại email',
            width: '70%',
        });
        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
        const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
        dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
        ref.onClose.subscribe((result: boolean) => {
            if (result) {
                this.alertService.showSuccess(
                    MessageConstants.CHANGE_EMAIL_SUCCCESS_MSG
                );
                this.selectedItems = [];
                this.loadData();
            }
        });
    }

    onPageChanged(event: any): void {
        this.pageIndex = event.page + 1;
        this.pageSize = event.rows;
        this.loadData();
    }
   
    
    onAssignRole(id: string) {
        const ref = this.dialogService.open(RoleAssignComponent, {
            data: {
                id: id,
            },
            header: 'Gán quyền',
            width: '70%',
        });
        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
        const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
        dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
        ref.onClose.subscribe((result: boolean) => {
            if (result) {
                this.alertService.showSuccess(
                    MessageConstants.ROLE_ASSIGN_SUCCESS_MSG
                );
                this.loadData();
            }
        });
    }

    private toggleBlockUI(enabled: boolean) {
        if (enabled == true) {
            this.blockedPanel = true;
        } else {
            this.blockedPanel = false;
        }
    }
}
