import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Archive, Edit, Trash2, FileText } from "lucide-react";
import type { CombinedItem } from "@/hooks/useUnpostTask";

interface UnpostTableProps {
  items: CombinedItem[];
  currentItems: CombinedItem[];
  currentPage: number;
  totalPages: number;
  onEditTask: (item: CombinedItem) => void;
  onDeleteItem: (item: CombinedItem) => void;
  onPageChange: (page: number) => void;
}

export function UnpostTable({
  items,
  currentItems,
  currentPage,
  totalPages,
  onEditTask,
  onDeleteItem,
  onPageChange,
}: UnpostTableProps) {
  const getCompanyName = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.company?.name || "N/A";
    } else {
      // For complaints, use contact person as company name or default
      return "Online Complaint";
    }
  };

  return (
    <Card>
      <CardHeader className="py-4 bg-orange-50">
        <div className="flex flex-col items-start gap-4">
          <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
            <Archive className="h-4 w-4" />
            Tasks & Complaints ({items.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Edit/Unpost tasks and delete any items
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium">No items available</p>
            <p className="text-xs">Items will appear here once available</p>
          </div>
        ) : (
          <>
            <div className="responsive-table max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-50 border-b sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Code/Number
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Company
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      City
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Address
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Work/Software Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.map((item, index) => (
                    <tr
                      key={`${item.type}-${item._id}`}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-orange-50/30"
                      } hover:bg-orange-100 transition-colors`}
                    >
                      <td className="px-3 py-2">
                        <Badge
                          className={`text-xs ${
                            item.type === 'task' 
                              ? 'bg-blue-600' 
                              : 'bg-purple-600'
                          }`}
                        >
                          {item.type === 'task' ? 'Task' : 'Complaint'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono border-orange-300"
                        >
                          {item.type === 'task' 
                            ? item.code?.split("-")[1] || item.code
                            : item.complaintNumber?.split("-")[1] || item.complaintNumber
                          }
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 text-gray-400 mr-1" />
                          <span
                            className="font-medium text-gray-900 truncate max-w-[80px] sm:max-w-24"
                            title={getCompanyName(item)}
                          >
                            {getCompanyName(item)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-gray-900 text-xs">
                          {item.company?.city || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="text-gray-900 truncate max-w-[100px] block text-xs"
                          title={item.company?.address || "N/A"}
                        >
                          {item.company?.address || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="text-gray-900 truncate max-w-[100px] block text-xs"
                          title={item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
                        >
                          {item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className="bg-green-600 text-xs">
                          {item.status || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-2">
                          {item.type === 'task' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEditTask(item)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-100"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="text-gray-400 border-gray-300 cursor-not-allowed"
                            >
                              <FileText className="h-3 w-3 mr-0" />
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteItem(item)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}