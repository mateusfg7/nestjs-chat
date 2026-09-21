export class SigninCommand {
  public constructor(
    public readonly property: string, // Email or Username
    public readonly password: string
  ) {}
}
