"use client";

import { useEffect, useState } from "react";
import { columns, User } from "@/components/users/columns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserDataTable } from "@/components/users/data-table";
import { getAllUsers, createUser, updateUser, getUser } from "./action";

const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["user", "admin", "owner"]),
  profile: z.object({
    full_name: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
    address: z.string().min(1, "Alamat wajib diisi"),
  }),
});

const updateUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().optional(),
  role: z.enum(["user", "admin", "owner"]),
  profile: z.object({
    full_name: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
    address: z.string().min(1, "Alamat wajib diisi"),
  }),
});

type CreateFormValues = z.infer<typeof createUserSchema>;
type UpdateFormValues = z.infer<typeof updateUserSchema>;

export default function UserPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data as User[]);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
      profile: {
        full_name: "",
        email: "",
        phone: "",
        address: "",
      },
    },
  });

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
      profile: {
        full_name: "",
        email: "",
        phone: "",
        address: "",
      },
    },
  });

  const onCreateSubmit = async (data: CreateFormValues) => {
    try {
      await createUser(data);
      toast.success("User berhasil ditambahkan");
      createForm.reset();
      setSheetOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan user");
    }
  };

  const onUpdateSubmit = async (data: UpdateFormValues) => {
    if (!editingUser) return;

    try {
      const updateData: any = {
        username: data.username,
        role: data.role,
        profile: data.profile,
      };

      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      await updateUser(editingUser.id, updateData);
      toast.success("User berhasil diperbarui");
      updateForm.reset();
      setEditingUser(null);
      setSheetOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui user");
    }
  };

  const onEdit = async (user: User) => {
    try {
      // Fetch complete user data including profile
      const userData = await getUser(user.id);
      if (!userData) {
        toast.error("User tidak ditemukan");
        return;
      }

      setEditingUser(userData as User);

      // Handle profiles array (get first profile if exists)
      const profile =
        Array.isArray(userData.profiles) && userData.profiles.length > 0
          ? userData.profiles[0]
          : null;

      updateForm.reset({
        username: userData.username,
        password: "",
        role: userData.role as "user" | "admin" | "owner",
        profile: {
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
        },
      });
      setSheetOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data user");
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    createForm.reset();
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setEditingUser(null);
      createForm.reset();
      updateForm.reset();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen User</h1>
        <Sheet open={sheetOpen} onOpenChange={handleSheetClose}>
          <SheetTrigger asChild>
            <Button onClick={handleAddNew}>Tambah User</Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[600px] overflow-auto"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? "Edit User" : "Form User Baru"}
            </h2>

            {editingUser ? (
              <Form {...updateForm}>
                <form
                  onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="username"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password (Kosongkan jika tidak diubah)
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="role"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.full_name"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.email"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.phone"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.address"
                    control={updateForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Update User
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...createForm}>
                <form
                  onSubmit={createForm.handleSubmit(onCreateSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="username"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="role"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.full_name"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.email"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.phone"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profile.address"
                    control={createForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Tambah User
                  </Button>
                </form>
              </Form>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <UserDataTable
        columns={columns({ onEdit, onRefresh: fetchUsers })}
        data={users}
      />
    </div>
  );
}
