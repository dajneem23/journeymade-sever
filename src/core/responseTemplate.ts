class ResponseTemplate {
  readonly res: any;
  readonly status: number;
  readonly data: object;
  message: string;
  code: string;

  constructor(res, { status, data, message = undefined, code = undefined }) {
    this.res = res;

    this.status = status;
    this.data = data;
    this.message = message;
    this.code = code;
  }

  send() {
    try {
      return this.res.status(this.status).json(this.json);
    } catch (e) {
      return this.res.status(500).json({});
    }
  }

  get json() {
    return JSON.parse(
      JSON.stringify({
        status: this.status,
        data: this.data,
        message: this.message,
        code: this.code,
      }),
    );
  }
}

export class SuccessResponse extends ResponseTemplate {
  constructor(res, { data, message = 'OK' }) {
    super(res, {
      status: 200,
      data,
      message,
    });
  }
}

export class FailResponse extends ResponseTemplate {
  constructor(res, { data, message }) {
    super(res, {
      status: 400,
      data,
      message,
    });
  }
}

export class ErrorResponse extends ResponseTemplate {
  constructor(res, { data, message, status, code }) {
    super(res, {
      status: status || 500,
      data,
      code,
      message,
    });
  }
}
