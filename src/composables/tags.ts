export interface Tag<T = unknown> {
  name: string
  value?: T
}

export type Tags = Tag[] | readonly Tag[];

export const createTag = (tagString: string) => {
  const [name, value] = tagString.split(':');
  const isNumber = /^\d+(?:\.\d+)?$/;
  if (isNumber.test(value)) {
    return {
      name,
      value: Number.parseFloat(value),
    };
  }
  return {
    name,
    value,
  };
};

export const createTags = (tagStrings: string[]) => {
  return tagStrings.map(createTag);
};

export const getTag = <T>(tags: Tags, name: string): Tag<T> => {
  return tags.find(tag => tag.name === name) as Tag<T>;
};

export const hasTag = (tags: Tags, tagToMatch: Tag) => {
  return tags.some(tag => tag.name === tagToMatch.name);
};

export const hasSomeTags = (tags: Tags, tagsToMatch: Tags) => {
  return tagsToMatch.some(tagToMatch => hasTag(tags, tagToMatch));
};

export const hasEveryTags = (tags: Tags, tagsToMatch: Tags) => {
  return tagsToMatch.every(tagToMatch => hasTag(tags, tagToMatch));
};
