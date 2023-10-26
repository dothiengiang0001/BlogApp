import { Component, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { DomSanitizer } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import Ultilities from './Ultilities/Ultilities';
import { AdminApiRoleApiClient, AdminApiUserApiClient, RoleDto, UserDto } from 'src/app/api/admin-api.service.generated';
@Component({
  templateUrl: 'user-detail.component.html',
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public roles: any[] = [];
  selectedEntity = {} as UserDto;
  public avatarImage;

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = Ultilities.getValidationMessages();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private roleService: AdminApiRoleApiClient,
    private userService: AdminApiUserApiClient,
    private utilService: UtilityService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  
  /** Life cycle */
  ngOnInit() {
    //Init form
    this.form = Ultilities.buildForm(this.form, this.fb, this.selectedEntity);
    //Load data to form
    this.loadDataToForm();
  }
  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** Loadding data */
  loadDataToForm() {
    var roles = this.roleService.getAllRoles();
    this.toggleBlockUI(true);

    forkJoin({ roles })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (repsonse: any) => {
          //Push categories to dropdown list
          var roles = repsonse.roles as RoleDto[];
          roles.forEach(element => {
            this.roles.push({
              value: element.id,
              label: element.name,
            });
          });

          if (this.utilService.isEmpty(this.config.data?.id) == false) {
            this.loadFormDetails(this.config.data?.id);
          } else {
            this.setMode('create');
            this.toggleBlockUI(false);
          }
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }
  loadFormDetails(id: string) {
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserDto) => {
          this.selectedEntity = response;
          this.form = Ultilities.buildForm(this.form, this.fb, this.selectedEntity);
          this.setMode('update');

          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  /** EVENTS */
  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({
          avatarFileName: file.name,
          avatarFileContent: reader.result,
        });

        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
  onSubmitForm() {
    this.toggleBlockUI(true);
    this.saveData();
  }
  saveData() {
    this.toggleBlockUI(true);
    console.log(this.form.value);
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.userService
        .createUser(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
            this.toggleBlockUI(false);
          },
          error: () => {
            this.toggleBlockUI(false);
          },
        });
    } else {
      this.userService
        .updateUser(this.config.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.toggleBlockUI(false);

            this.ref.close(this.form.value);
          },
          error: () => {
            this.toggleBlockUI(false);
          },
        });
    }
  }


  /** OTHERS */
  // Toggle Loadding => loadDataToForm, onSubmitForm
  // True => disable submit button and show loadding
  // False => enable submit button and show loadding
  toggleBlockUI(enabled: boolean) {
    if (enabled == true) {
      this.btnDisabled = true;
      this.blockedPanelDetail = true;
    } else {
      this.btnDisabled = false;
      this.blockedPanelDetail = false;
    }
  }

  setMode(mode: string) {
    if (mode == 'update') {
      this.form.controls['userName'].clearValidators();
      this.form.controls['userName'].disable();
      this.form.controls['email'].clearValidators();
      this.form.controls['email'].disable();
      this.form.controls['password'].clearValidators();
      this.form.controls['password'].disable();
    } else if (mode == 'create') {
      this.form.controls['userName'].addValidators(Validators.required);
      this.form.controls['userName'].enable();
      this.form.controls['email'].addValidators(Validators.required);
      this.form.controls['email'].enable();
      this.form.controls['password'].addValidators(Validators.required);
      this.form.controls['password'].enable();
    }
  }
}
