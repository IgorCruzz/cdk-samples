import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";

interface DropzoneFieldProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
  accept?: Record<string, string[]>;
}

export function DropzoneField<T extends FieldValues>({
  label = "Selecione um arquivo",
  accept = { "application/pdf": [".pdf"] },
  ...controllerProps
}: DropzoneFieldProps<T>) {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        const onDrop = (acceptedFiles: File[]) => {
            field.onChange(acceptedFiles[0]);
        } 
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          multiple: false,
          accept,
        });

        const files = [field.value as File]

        return (
          <div className="space-y-1">
            {label && (
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
            )}

            <div
              {...getRootProps()}
              className="p-6 border-2 border-dashed rounded-md cursor-pointer text-center hover:bg-gray-100"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Solte o arquivo aqui...</p>
              ) : files.length > 0 ? (
                <ul className="text-sm text-gray-600">
                  {files.map((file, i) => (
                    <li key={i}>{file.name}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  Arraste e solte o arquivo aqui, ou clique para selecionar
                </p>
              )}
            </div>

            {fieldState.error && (
              <p className="text-sm text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
