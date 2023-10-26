export class Helper {
    public static capitalizeFieldName(fieldName: string): string {
        return fieldName.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
      }
}
