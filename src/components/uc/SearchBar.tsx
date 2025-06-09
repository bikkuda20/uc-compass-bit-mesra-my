
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-5 w-5 text-gray-500" />
      <Input
        type="text"
        placeholder="Search by project code, PI name, agency, scheme, or year..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};
