import { User } from "../entities/User";
import { MyContext } from "src/types";
import argon2 from "argon2";

import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";

@InputType()
class UserNamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserNamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
      if(options.username.length <= 2){
          return {
              errors: [{
                  field: "username",
                  message: "length must be greater than two";
                  

              }]
          }
      }
    
      if(options.password.length <= 2){
        return {
            errors: [{
                field: "password",
                message: "length must be greater than three";
                

            }]
        }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
        await em.persistAndFlush(user);
    } catch (err) {
        if(err.code === '2305'){
            return {
                errors: [{
                    field: "username", 
                    message: "username taken"
                }]
            } 
        }
    }

    return {user};
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserNamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "username does not exists" }],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return { errors: [{ field: "password", message: "incorrect password" }] };
    }
    await em.persistAndFlush(user);

    options.password;
    return { user };
  }
}
