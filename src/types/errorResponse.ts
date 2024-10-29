import MessageResponse from './messageResponse';

export default interface ErrorResponse extends MessageResponse {
  ok: false;
  stack?: string;
}
