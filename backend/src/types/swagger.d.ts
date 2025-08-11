declare module '@nestjs/swagger' {
  class DocumentBuilder {
    setTitle(title: string): DocumentBuilder;
    setDescription(description: string): DocumentBuilder;
    setVersion(version: string): DocumentBuilder;
    build(): unknown;
  }
  const SwaggerModule: {
    createDocument(app: unknown, config: unknown): unknown;
    setup(path: string, app: unknown, document: unknown): void;
  };
  export { DocumentBuilder, SwaggerModule };
}
