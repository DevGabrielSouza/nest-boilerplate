export class messagesType {
  message: string;
  property: string;
}
export class ApiResponseDto<T> {
  statusCode: number;
  messages: messagesType[] | [];
  data: T;
}
