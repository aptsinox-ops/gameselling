import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    setDeleteTarget?: React.Dispatch<
      React.SetStateAction<{
        isBulk: boolean;
        id?: string;
        name?: string;
        receiptNo?: string;
      }>
    >;
    setDeleteTarget?: React.Dispatch<React.SetStateAction<any>>
    setIsAlertOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    setData?: React.Dispatch<React.SetStateAction<any[]>>;
    setEditItem?: React.Dispatch<React.SetStateAction<any>>;
  }
}