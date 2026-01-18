export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const genericMessage =
  "We couldn't complete that request. Please try again.";

export const getUserFacingMessage = (status?: number, isNetworkError = false) => {
  if (isNetworkError) {
    return "Network error. Check your connection and try again.";
  }

  if (status === 429) {
    return "We're getting rate limited. Please try again in a moment.";
  }

  if (status && status >= 500) {
    return "The service is having trouble right now. Please try again soon.";
  }

  if (status && status >= 400) {
    return "We couldn't complete that request. Please check your input.";
  }

  return genericMessage;
};
