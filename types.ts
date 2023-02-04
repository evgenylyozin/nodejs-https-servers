export type DataObject = {
  files: FileObject[];
  [key: string]: string | FileObject[];
};

export type FileObject = {
  filename?: string;
  contentType?: string;
  data: string;
};
