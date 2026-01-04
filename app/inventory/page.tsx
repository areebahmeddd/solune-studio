"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@/hooks/use-inventory";
import { useInventory } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  Download,
  Edit,
  History,
  Package,
  PackageX,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function InventoryPage() {
  useEffect(() => {
    document.title = "Solune Studio - Inventory";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    products,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    deleteTransaction,
    getCurrentStock,
  } = useInventory();

  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [isDeleteTransactionOpen, setIsDeleteTransactionOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    expiryDate: undefined as Date | undefined,
  });

  const [transactionForm, setTransactionForm] = useState<{
    productId: string;
    type: "revaluation" | "transaction";
    quantity: number | null;
    price: number | null;
    date: Date;
  }>({
    productId: "",
    type: "revaluation",
    quantity: 0,
    price: 0,
    date: new Date(),
  });

  useEffect(() => {
    if (!loading && !user) {
      const isSigningOut = sessionStorage.getItem("signing-out");
      if (!isSigningOut) {
        toast.error("Please sign in to access this page");
      } else {
        sessionStorage.removeItem("signing-out");
      }
      router.push("/signin");
    }
  }, [user, loading, router]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const productWithStock = useMemo(() => {
    return filteredProducts.map((product) => ({
      ...product,
      currentStock: getCurrentStock(product.id),
    }));
  }, [filteredProducts, getCurrentStock]);

  const filteredTransactions = useMemo(() => {
    if (!transactionSearchTerm) return transactions;
    return transactions.filter((t) =>
      t.productName.toLowerCase().includes(transactionSearchTerm.toLowerCase()),
    );
  }, [transactions, transactionSearchTerm]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, typeof transactions>();

    filteredTransactions.forEach((transaction) => {
      if (!groups.has(transaction.productId)) {
        groups.set(transaction.productId, []);
      }
      groups.get(transaction.productId)!.push(transaction);
    });

    return Array.from(groups.entries()).map(([productId, txns]) => ({
      productId,
      productName: txns[0].productName,
      transactions: txns,
      currentStock: getCurrentStock(productId),
    }));
  }, [filteredTransactions, getCurrentStock]);

  const totalProducts = products.length;
  const totalTransactions = transactions.length;
  const outOfStockProducts = productWithStock.filter(
    (p) => p.currentStock === 0,
  ).length;

  const resetProductForm = () => {
    setProductForm({ name: "", expiryDate: undefined });
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      productId: "",
      type: "revaluation",
      quantity: 0,
      price: 0,
      date: new Date(),
    });
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.expiryDate) {
      toast.error("Please fill all required fields");
      return;
    }
    await addProduct({
      name: productForm.name,
      expiryDate: format(productForm.expiryDate, "yyyy-MM-dd"),
    });
    setIsAddProductOpen(false);
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      expiryDate: product.expiryDate ? new Date(product.expiryDate) : undefined,
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    if (!productForm.name || !productForm.expiryDate) {
      toast.error("Please fill all required fields");
      return;
    }
    await updateProduct(editingProduct.id, {
      name: productForm.name,
      expiryDate: format(productForm.expiryDate, "yyyy-MM-dd"),
    });
    setIsEditProductOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteProductOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id);
      setIsDeleteProductOpen(false);
      setDeletingProduct(null);
    }
  };

  const handleAddTransaction = async () => {
    if (
      !transactionForm.productId ||
      transactionForm.quantity === null ||
      transactionForm.quantity === undefined ||
      (transactionForm.type === "revaluation" &&
        transactionForm.quantity < 0) ||
      (transactionForm.type === "transaction" && transactionForm.quantity === 0)
    ) {
      return;
    }

    if (
      transactionForm.type === "transaction" &&
      (transactionForm.price === null ||
        transactionForm.price === undefined ||
        transactionForm.price <= 0)
    ) {
      toast.error("Please enter a valid price for transaction");
      return;
    }

    const product = products.find((p) => p.id === transactionForm.productId);
    if (!product) return;

    await addTransaction({
      productId: transactionForm.productId,
      productName: product.name,
      type: transactionForm.type,
      quantity: transactionForm.quantity,
      price:
        transactionForm.type === "revaluation"
          ? 0
          : (transactionForm.price ?? 0),
      date: format(transactionForm.date, "yyyy-MM-dd"),
    });

    setIsAddTransactionOpen(false);
    resetTransactionForm();
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      productId: transaction.productId,
      type: transaction.type,
      quantity: transaction.quantity,
      price: transaction.price,
      date: new Date(transaction.date),
    });
    setIsEditTransactionOpen(true);
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;
    if (
      !transactionForm.productId ||
      transactionForm.quantity === null ||
      transactionForm.quantity === undefined ||
      (transactionForm.type === "revaluation" &&
        transactionForm.quantity < 0) ||
      (transactionForm.type === "transaction" && transactionForm.quantity === 0)
    ) {
      return;
    }

    if (
      transactionForm.type === "transaction" &&
      (transactionForm.price === null ||
        transactionForm.price === undefined ||
        transactionForm.price <= 0)
    ) {
      toast.error("Please enter a valid price for transaction");
      return;
    }

    const product = products.find((p) => p.id === transactionForm.productId);
    if (!product) return;

    await deleteTransaction(editingTransaction.id);
    await addTransaction({
      productId: transactionForm.productId,
      productName: product.name,
      type: transactionForm.type,
      quantity: transactionForm.quantity,
      price:
        transactionForm.type === "revaluation"
          ? 0
          : (transactionForm.price ?? 0),
      date: format(transactionForm.date, "yyyy-MM-dd"),
    });

    setIsEditTransactionOpen(false);
    setEditingTransaction(null);
    resetTransactionForm();
  };

  const handleDeleteTransaction = (transaction: any) => {
    setDeletingTransaction(transaction);
    setIsDeleteTransactionOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (deletingTransaction) {
      await deleteTransaction(deletingTransaction.id);
      setIsDeleteTransactionOpen(false);
      setDeletingTransaction(null);
    }
  };

  const exportToCSV = () => {
    if (activeTab === "products") {
      if (productWithStock.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = ["Product Name", "Expiry Date", "Current Stock"];
      const csvData = productWithStock.map((p) => [
        p.name,
        p.expiryDate ? format(new Date(p.expiryDate), "dd/MM/yyyy") : "-",
        p.currentStock.toString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `products-${format(new Date(), "dd-MM-yyyy")}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Products exported successfully");
    } else {
      if (filteredTransactions.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = ["Product", "Date", "Type", "Quantity", "Price"];
      const csvData = filteredTransactions.map((t) => [
        t.productName,
        format(new Date(t.date), "dd/MM/yyyy"),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.quantity.toString(),
        t.type === "revaluation" ? "-" : t.price.toString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions-${format(new Date(), "dd-MM-yyyy")}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Transactions exported successfully");
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Track stock levels and manage your products
            </p>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={
              activeTab === "products"
                ? productWithStock.length === 0
                : filteredTransactions.length === 0
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <PackageX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {outOfStockProducts}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <History className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-[250px] pl-9"
                      />
                    </div>
                    <Button onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="w-[140px]">Expiry Date</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Current Stock
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productWithStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      productWithStock.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            {product.expiryDate
                              ? format(
                                  new Date(product.expiryDate),
                                  "dd/MM/yyyy",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                product.currentStock === 0
                                  ? "destructive"
                                  : product.currentStock <= 5
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {product.currentStock}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stock Transactions</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={transactionSearchTerm}
                        onChange={(e) =>
                          setTransactionSearchTerm(e.target.value)
                        }
                        className="h-10 w-[250px] pl-9"
                      />
                    </div>
                    <Button onClick={() => setIsAddTransactionOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {groupedTransactions.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupedTransactions.map((group) => (
                      <Collapsible key={group.productId} defaultOpen>
                        <Card className="overflow-hidden">
                          <CollapsibleTrigger className="w-full group" asChild>
                            <div>
                              <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                                    <CardTitle className="text-base font-semibold">
                                      {group.productName}
                                    </CardTitle>
                                  </div>
                                  <Badge
                                    variant={
                                      group.currentStock === 0
                                        ? "destructive"
                                        : group.currentStock <= 5
                                          ? "secondary"
                                          : "default"
                                    }
                                  >
                                    Stock: {group.currentStock}
                                  </Badge>
                                </div>
                              </CardHeader>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="p-0">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-t">
                                    <TableHead className="h-10 w-12">
                                      #
                                    </TableHead>
                                    <TableHead className="h-10 w-[120px]">
                                      Date
                                    </TableHead>
                                    <TableHead className="h-10 w-[120px]">
                                      Type
                                    </TableHead>
                                    <TableHead className="h-10 w-[80px] text-right">
                                      Quantity
                                    </TableHead>
                                    <TableHead className="h-10 w-[100px] text-right">
                                      Price
                                    </TableHead>
                                    <TableHead className="h-10 w-[100px] text-right">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.transactions.map(
                                    (transaction, index) => (
                                      <TableRow
                                        key={transaction.id}
                                        className="h-12"
                                      >
                                        <TableCell className="py-2 py-2 font-medium">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell className="py-2">
                                          {format(
                                            new Date(transaction.date),
                                            "dd/MM/yyyy",
                                          )}
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <Badge
                                            variant={
                                              transaction.type === "revaluation"
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            {transaction.type === "revaluation"
                                              ? "Revaluation"
                                              : "Transaction"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 text-right font-semibold">
                                          {transaction.quantity}
                                        </TableCell>
                                        <TableCell className="py-2 text-right">
                                          {transaction.price > 0
                                            ? `₹${transaction.price}`
                                            : "-"}
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <div className="flex items-center justify-end gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() =>
                                                handleEditTransaction(
                                                  transaction,
                                                )
                                              }
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() =>
                                                handleDeleteTransaction(
                                                  transaction,
                                                )
                                              }
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ),
                                  )}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !productForm.expiryDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {productForm.expiryDate
                      ? format(productForm.expiryDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productForm.expiryDate}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setProductForm({ ...productForm, expiryDate: date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddProductOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter product name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !productForm.expiryDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {productForm.expiryDate
                      ? format(productForm.expiryDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productForm.expiryDate}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setProductForm({ ...productForm, expiryDate: date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditProductOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteProductOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Stock Transaction</DialogTitle>
            <DialogDescription>
              Record revaluation or transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-product">Product</Label>
              <Select
                value={transactionForm.productId}
                onValueChange={(value) =>
                  setTransactionForm({ ...transactionForm, productId: value })
                }
              >
                <SelectTrigger id="transaction-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={transactionForm.type}
                onValueChange={(value: any) =>
                  setTransactionForm({ ...transactionForm, type: value })
                }
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revaluation">Revaluation</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className={
                transactionForm.type === "revaluation"
                  ? "space-y-2"
                  : "grid grid-cols-2 gap-2"
              }
            >
              <div className="space-y-2">
                <Label htmlFor="transaction-quantity">Quantity</Label>
                <Input
                  id="transaction-quantity"
                  type="number"
                  placeholder="0"
                  value={
                    transactionForm.quantity === null ||
                    transactionForm.quantity === undefined
                      ? ""
                      : transactionForm.quantity
                  }
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      quantity:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              {transactionForm.type === "transaction" && (
                <div className="space-y-2">
                  <Label htmlFor="transaction-price">Price (₹)</Label>
                  <Input
                    id="transaction-price"
                    type="number"
                    placeholder="0"
                    value={
                      transactionForm.price === null ||
                      transactionForm.price === undefined
                        ? ""
                        : transactionForm.price
                    }
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        price:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !transactionForm.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionForm.date
                      ? format(transactionForm.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={transactionForm.date}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setTransactionForm({ ...transactionForm, date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTransactionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stock Transaction</DialogTitle>
            <DialogDescription>Update transaction details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-product">Product</Label>
              <Select
                value={transactionForm.productId}
                onValueChange={(value) =>
                  setTransactionForm({ ...transactionForm, productId: value })
                }
              >
                <SelectTrigger id="edit-transaction-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-type">Transaction Type</Label>
              <Select
                value={transactionForm.type}
                onValueChange={(value: any) =>
                  setTransactionForm({ ...transactionForm, type: value })
                }
              >
                <SelectTrigger id="edit-transaction-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revaluation">Revaluation</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className={
                transactionForm.type === "revaluation"
                  ? "space-y-2"
                  : "grid grid-cols-2 gap-2"
              }
            >
              <div className="space-y-2">
                <Label htmlFor="edit-transaction-quantity">Quantity</Label>
                <Input
                  id="edit-transaction-quantity"
                  type="number"
                  placeholder="0"
                  value={
                    transactionForm.quantity === null ||
                    transactionForm.quantity === undefined
                      ? ""
                      : transactionForm.quantity
                  }
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      quantity:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              {transactionForm.type === "transaction" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-transaction-price">Price (₹)</Label>
                  <Input
                    id="edit-transaction-price"
                    type="number"
                    placeholder="0"
                    value={
                      transactionForm.price === null ||
                      transactionForm.price === undefined
                        ? ""
                        : transactionForm.price
                    }
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        price:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !transactionForm.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionForm.date
                      ? format(transactionForm.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={transactionForm.date}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setTransactionForm({ ...transactionForm, date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTransactionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTransaction}>
              Update Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteTransactionOpen}
        onOpenChange={setIsDeleteTransactionOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This will affect
              stock calculations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteTransactionOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTransaction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
