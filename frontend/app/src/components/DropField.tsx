import {
  Controller,
  type UseControllerProps,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";

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

        const files = field.value ? [field.value as File] : [];

        return (
          <div className="w-full">
            <div
              {...getRootProps()}
              className="
                w-full p-6 border-2 border-dashed rounded-md cursor-pointer text-center
                bg-[--muted] text-[--muted-foreground] 
                hover:brightness-75
                dark:bg-[--muted-foreground] dark:text-[--muted]
              "
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drag a file here...</p>
              ) : files.length > 0 ? (
                <ul className="text-sm">
                  {files.map((file, i) => (
                    <li key={i}>{file.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Drag and drop a file here, or click to select a file</p>
              )}
            </div>

            {fieldState.error && (
              <p className="text-sm text-destructive mt-1">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default DropField;
