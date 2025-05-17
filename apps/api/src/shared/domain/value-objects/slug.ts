type SlugProps = {
  value: string;
};

export class Slug {
  readonly value: string;

  constructor({ value }: SlugProps) {
    this.value = this.formatToSlug(value);
  }

  private formatToSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  static from(value: string): Slug {
    return new Slug({ value });
  }

  static isValid(value: string): boolean {
    const slugPattern = /^[a-z0-9-]+$/;
    return slugPattern.test(value);
  }

  static toUpperCase(slug: string): string {
    return slug.toUpperCase();
  }
}
