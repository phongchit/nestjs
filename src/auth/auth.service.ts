import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user_clients, user_restaurant } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup.user.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ManagersService } from 'src/managers/managers.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private managersService: ManagersService,
    private jwtService: JwtService,
    @InjectRepository(user_clients) private readonly userRepository: Repository<user_clients>,
    @InjectRepository(user_restaurant) private readonly managerRepository: Repository<user_restaurant>
  ) {}

  async signupUser(signupDto: SignUpUserDto): Promise<user_clients> {
    const { email, username, password } = signupDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpass = await bcrypt.hashSync(password, salt);

    const newUser = this.userRepository.create({
      email,
      username,
      password: hashedpass,
    });
    return this.userRepository.save(newUser);
  }

  async signupManager(signupDto: SignUpUserDto): Promise<user_restaurant> {
    const { email, username, password } = signupDto;
    const existingUser = await this.managerRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpass = await bcrypt.hashSync(password, salt);

    const newUser = this.managerRepository.create({
      email,
      username,
      password: hashedpass,
    });
    return this.managerRepository.save(newUser);
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async loginUser(user: user_clients) {
    const payload = { username: user.username, id: user.id };
    const AccessToken = this.jwtService.sign(payload);

    return {
      AccessToken,
    };
  }
}
