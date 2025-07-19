import { Edit, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  disabled?: boolean;
  required?: boolean;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  help,
  disabled = false,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(!value); // Auto-edit se não há valor

  // Mostrar valor mascarado
  const getMaskedValue = () => {
    if (!value) return "";
    const visibleChars = Math.min(4, value.length);
    return (
      "•".repeat(Math.max(0, value.length - visibleChars)) +
      value.slice(-visibleChars)
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPassword(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPassword(false);
    // Optionally reset to original value
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        {isEditing ? (
          <Input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-20"
          />
        ) : (
          <div className="relative">
            <Input
              type="text"
              value={getMaskedValue()}
              placeholder={placeholder || "Clique para editar"}
              className="pr-20 cursor-pointer bg-gray-50"
              onClick={handleEdit}
              readOnly
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              disabled={disabled}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {help && <p className="text-xs text-gray-500">{help}</p>}

      {isEditing && value && (
        <div className="flex space-x-2">
          <Button type="button" size="sm" onClick={handleSave} className="h-8">
            Confirmar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-8"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
