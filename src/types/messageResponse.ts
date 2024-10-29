export default interface MessageResponse {
  ok: boolean;
  message: string;
  data?: Record<string, any>;
}
