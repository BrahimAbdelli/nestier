import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateObjectIdPipe } from '@shared/common/pipes';
import { UserService } from '../../application/services/user.service';
import { User } from '../../domain/value-objects/user';
import { UserLogin } from '../../domain/value-objects/user-login';
import { UserUpdatePassword } from '../../domain/value-objects/user-update-password';
import { CreateUserDto, UpdateNewPasswordDto, UpdateUserDto, UserLoginDto, UserLoginResponseDto, UserResponseDto } from '../dtos';
import { FindAndSearchUserResponseDto } from '../dtos/find-and-search-user-response.dto';
import { UserDto } from '../dtos/user.dto';
import { UserDtoMapper } from '../mappers/user-dto.mapper';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userDtoMapper: UserDtoMapper
  ) { }

  @Get('')
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async findAll(): Promise<FindAndSearchUserResponseDto[]> {
    const users: User[] = await this.userService.findAll();
    return this.userDtoMapper.domainsToFindAndSearchDtos(users);
  }

  @Get('email/:email')
  @ApiBody({ description: 'email', required: true })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async findByEmail(@Param() params): Promise<UserDto> {
    const user: User = await this.userService.findByEmail(params.email);
    return this.userDtoMapper.domainToDto(user);
  }

  @Get('username/:username')
  @ApiBody({ description: 'username', required: true })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async findByUsername(@Param() params): Promise<UserDto> {
    const user: User = await this.userService.findByUsername(params.username);
    return this.userDtoMapper.domainToDto(user);
  }

  @Get('user/:id')
  @ApiBody({ description: 'id', required: true })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async findById(@Param(new ValidateObjectIdPipe('User')) id): Promise<UserDto> {
    const user: User = await this.userService.findOneById(id);
    return this.userDtoMapper.domainToDto(user);
  }

  @Post('login')
  @ApiBody({ type: [UserLoginDto] })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async login(@Body() loginUserDto: UserLoginDto): Promise<UserLoginResponseDto> {
    const userLogin: UserLogin = this.userDtoMapper.loginDtoToDomain(loginUserDto);
    const user: User = await this.userService.login(userLogin);
    return this.userDtoMapper.domainToUserLoginResponseDto(user);
  }

  @Post('forgot-password/:email')
  @ApiBody({ description: 'email', required: true })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object', type: UserResponseDto })
  public async forgotPassword(@Param() params): Promise<UserResponseDto> {
    const user: User = await this.userService.forgotPassword(params.email);
    return this.userDtoMapper.domainToUserResponseDto(user);
  }

  @Post('reset-password')
  @ApiBody({ type: [UpdateNewPasswordDto] })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async updateNewPassword(@Body() updateNewPasswordDto: UpdateNewPasswordDto): Promise<UserResponseDto> {
    const userUpdatePassword: UserUpdatePassword = this.userDtoMapper.updatePasswordDtoToDomain(updateNewPasswordDto);
    const user: User = await this.userService.updateNewPassword(userUpdatePassword);
    return this.userDtoMapper.domainToUserResponseDto(user);
  }

  @Post('signup')
  @ApiBody({ type: [CreateUserDto] })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async create(@Body() userData: CreateUserDto): Promise<void> {
    const user: User = this.userDtoMapper.createDtoToDomain(userData);
    await this.userService.create(user);
  }

  @Put('user/:id')
  @ApiBody({ type: [UpdateUserDto] })
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'Returns a user object' })
  public async update(
    @Param(new ValidateObjectIdPipe('User')) id,
    @Body() userData: UpdateUserDto
  ): Promise<UserDto> {
    const user: User = this.userDtoMapper.updateDtoToDomain(userData);
    user._id = id;
    const updatedUser: User = await this.userService.update(user);
    return this.userDtoMapper.domainToDto(updatedUser);
  }

  @Patch('archive/:id')
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'User archived successfully' })
  public async archive(@Param(new ValidateObjectIdPipe('User')) id): Promise<void> {
    await this.userService.archive(id);
  }

  @Patch('unarchive/:id')
  @ApiOperation({ summary: `Throws error 404 if not found` })
  @ApiOkResponse({ description: 'User unarchived successfully' })
  public async unarchive(@Param(new ValidateObjectIdPipe('User')) id): Promise<void> {
    await this.userService.unarchive(id);
  }
}
