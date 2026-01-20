import { useState, useMemo } from "react";
import { Search, Filter, X, Tag, Hash, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SharedCircuit } from "@/hooks/useCommunity";

export interface FilterState {
  search: string;
  selectedTags: string[];
  neuronCountRange: string;
  creator: string;
}

interface CircuitFiltersProps {
  circuits: SharedCircuit[];
  onFilterChange: (filteredCircuits: SharedCircuit[]) => void;
}

export function CircuitFilters({ circuits, onFilterChange }: CircuitFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    selectedTags: [],
    neuronCountRange: "all",
    creator: "",
  });

  // Extract all unique tags from circuits
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    circuits.forEach((circuit) => {
      circuit.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [circuits]);

  // Extract all unique creators
  const allCreators = useMemo(() => {
    const creatorSet = new Set<string>();
    circuits.forEach((circuit) => {
      const name = circuit.profiles?.display_name;
      if (name) creatorSet.add(name);
    });
    return Array.from(creatorSet).sort();
  }, [circuits]);

  // Apply filters
  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...circuits];

    // Search filter (title, description, creator name)
    if (newFilters.search.trim()) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (circuit) =>
          circuit.title.toLowerCase().includes(searchLower) ||
          circuit.description?.toLowerCase().includes(searchLower) ||
          circuit.profiles?.display_name?.toLowerCase().includes(searchLower) ||
          circuit.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          circuit.neurons_used.some((n) => n.toLowerCase().includes(searchLower))
      );
    }

    // Tag filter
    if (newFilters.selectedTags.length > 0) {
      filtered = filtered.filter((circuit) =>
        newFilters.selectedTags.some((tag) => circuit.tags?.includes(tag))
      );
    }

    // Neuron count filter
    if (newFilters.neuronCountRange !== "all") {
      filtered = filtered.filter((circuit) => {
        const count = circuit.neurons_used.length;
        switch (newFilters.neuronCountRange) {
          case "1-5":
            return count >= 1 && count <= 5;
          case "6-10":
            return count >= 6 && count <= 10;
          case "11-20":
            return count >= 11 && count <= 20;
          case "21+":
            return count >= 21;
          default:
            return true;
        }
      });
    }

    // Creator filter
    if (newFilters.creator) {
      filtered = filtered.filter(
        (circuit) => circuit.profiles?.display_name === newFilters.creator
      );
    }

    onFilterChange(filtered);
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    updateFilters({ selectedTags: newTags });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      selectedTags: [],
      neuronCountRange: "all",
      creator: "",
    };
    setFilters(clearedFilters);
    onFilterChange(circuits);
  };

  const hasActiveFilters =
    filters.search ||
    filters.selectedTags.length > 0 ||
    filters.neuronCountRange !== "all" ||
    filters.creator;

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, creator, tags, or neurons..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-card border-2 border-foreground"
          />
        </div>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`gap-2 border-2 border-foreground ${
                hasActiveFilters ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {(filters.selectedTags.length > 0 ? 1 : 0) +
                    (filters.neuronCountRange !== "all" ? 1 : 0) +
                    (filters.creator ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="font-bold uppercase text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Options
              </div>

              {/* Neuron Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  Neuron Count
                </label>
                <Select
                  value={filters.neuronCountRange}
                  onValueChange={(value) => updateFilters({ neuronCountRange: value })}
                >
                  <SelectTrigger className="border-2 border-foreground">
                    <SelectValue placeholder="Any count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any count</SelectItem>
                    <SelectItem value="1-5">1-5 neurons</SelectItem>
                    <SelectItem value="6-10">6-10 neurons</SelectItem>
                    <SelectItem value="11-20">11-20 neurons</SelectItem>
                    <SelectItem value="21+">21+ neurons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Filter */}
              {allCreators.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Creator
                  </label>
                  <Select
                    value={filters.creator || "all"}
                    onValueChange={(value) =>
                      updateFilters({ creator: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger className="border-2 border-foreground">
                      <SelectValue placeholder="Any creator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any creator</SelectItem>
                      {allCreators.map((creator) => (
                        <SelectItem key={creator} value={creator}>
                          {creator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-colors"
                        onClick={() => toggleTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground uppercase font-mono">
            Active filters:
          </span>
          {filters.selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleTag(tag)}
            >
              #{tag}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.neuronCountRange !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilters({ neuronCountRange: "all" })}
            >
              {filters.neuronCountRange} neurons
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.creator && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilters({ creator: "" })}
            >
              by {filters.creator}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
