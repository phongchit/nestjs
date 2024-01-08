import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalManagerAuthGuard extends AuthGuard('local-manager') {}
