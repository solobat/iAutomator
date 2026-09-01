import { Alert, AlertColor, Snackbar } from "@mui/material";
import { createContext, ReactNode, useContext, useState } from "react";

type MessageFn = (content: string) => void;

const MessageContext = createContext<{
  success: MessageFn;
  error: MessageFn;
}>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  success: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error: () => {},
});

export function useMessage() {
  return useContext(MessageContext);
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const show = (message: string, type: AlertColor) => {
    setContent(message);
    setSeverity(type);
    setOpen(true);
  };

  return (
    <MessageContext.Provider
      value={{
        success: (message) => show(message, "success"),
        error: (message) => show(message, "error"),
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {content}
        </Alert>
      </Snackbar>
    </MessageContext.Provider>
  );
}
