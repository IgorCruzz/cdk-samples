import {
  Controller,
  type UseControllerProps,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react"; // Ícone de "fechar/remover"

const DropField = ({
  ...controllerProps
}: UseControllerProps) => {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        const onDrop = (acceptedFiles: File[]) => {
          field.onChange(acceptedFiles[0]);
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          multiple: false,
          accept: {
            "text/csv": [".csv"],
          },
        });

        const file = field.value as File | undefined;

        return (
          <div className="w-full h-full">
            <div
              {...getRootProps()}
              className="
                w-full h-full p-6 border-2 border-dashed rounded-md cursor-pointer text-center
                bg-[--muted] text-[--muted-foreground] 
                hover:brightness-75
                dark:bg-[--muted-foreground] dark:text-[--muted]
                flex items-center justify-center
              "
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drag a file here...</p>
              ) : file ? (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();  
                      field.onChange(null); 
                    }}
                    className="
                      p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition
                      text-red-500"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-center">Drag and drop a file here, or click to select a file</p>
              )}
            </div> 
          </div>
        );
      }}
    />
  );
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default DropField;
