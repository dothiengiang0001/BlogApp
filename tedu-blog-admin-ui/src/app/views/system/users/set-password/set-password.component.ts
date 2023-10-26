import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import {
  Validators,
  FormControl,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiUserApiClient, ChangeMyPasswordRequest, RoleDto } from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'set-password.component.html',
})
export class SetPasswordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public closeBtnName: string;
  selectedEntity = {} as RoleDto;

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private userService: AdminApiUserApiClient,
    private fb: FormBuilder
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.buildForm();
    this.saveBtnName = 'Cập nhật';
    this.closeBtnName = 'Hủy';
  }

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    newPassword: [
      { type: 'required', message: 'Bạn phải nhập mật khẩu' },
      { type: 'pattern', message: 'Mật khẩu ít nhất 8 ký tự, ít nhất 1 số, 1 ký tự đặc biệt, và một chữ hoa' },
    ],
    confirmNewPassword: [
      { type: 'required', message: 'Bạn phải nhập mật khẩu' },
      { type: 'confirmedValidator', message: 'Xác nhận mật khẩu không trùng khớp' },
    ],
  };

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData() {
    if (!this.form?.valid) {
      return;
    }
    this.userService
      .setPassword(this.config.data.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleBlockUI(false);
        this.ref.close(this.form.value);
      });
  }

  buildForm() {
    this.form = this.fb.group(
      {
        newPassword: new FormControl(
          null,
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}$'
            ),
          ])
        ),
        confirmNewPassword: new FormControl(
          null,
          Validators.compose([
            Validators.required
          ])),
      },
      {
        validator: this.confirmedValidator('newPassword', 'confirmNewPassword'),
      }
    );
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled == true) {
      this.btnDisabled = true;
      this.blockedPanelDetail = true;
    } else {
      setTimeout(() => {
        this.btnDisabled = false;
        this.blockedPanelDetail = false;
      }, 1000);
    }
  }

  confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
}
