import { formatDate } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { Observable, Subject, forkJoin, takeUntil } from "rxjs";
import { RoleDto, UserDto } from "src/app/api/admin-api.service.generated";
import { UtilityService } from "src/app/shared/services/utility.service";

export default class Ultilities {
  public static getValidationMessages() {
    const validationMessages = {
      firstName: [{ type: 'required', message: 'firstName must be require' }],
      lastName: [{ type: 'required', message: 'lastName must be require' }],
      userName: [
        { type: 'required', message: 'userName must be require' },
      ],
      email: [
        { type: 'required', message: 'email must be require' },
        { type: 'email', message: 'email is invalid' },
      ],
      phoneNumber: [
        { type: 'required', message: 'Phone must be require' },
        { type: 'pattern', message: 'phoneNumber is invalid '}
      ],
      password: [
        { type: 'required', message: 'password must be require' },
        { type: 'pattern', message: 'password is invalid' },
      ],
    };
    return validationMessages;
  }

  public static buildForm(form: FormGroup<any>, fb: FormBuilder, selectedEntity: UserDto): FormGroup<any> {
    form = fb.group({
      firstName: new FormControl(selectedEntity.firstName || null, Validators.required),
      lastName: new FormControl(selectedEntity.lastName || null, Validators.required),
      userName: new FormControl(selectedEntity.userName || null, Validators.compose([Validators.required])),
      email: new FormControl(selectedEntity.email || null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
      phoneNumber: new FormControl(selectedEntity.phoneNumber || null, Validators.compose([
        Validators.required,
        Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)

      ])),
      password: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}$/
          ),
        ])
      ),
      dob: new FormControl(
        selectedEntity.dob ? formatDate(selectedEntity.dob, 'yyyy-MM-dd', 'en') : null
      ),
      avatarFile: new FormControl(null),
      avatar: new FormControl(selectedEntity.avatar || null),
      isActive: new FormControl(selectedEntity.isActive || true),
    });
    return form;
  }
}