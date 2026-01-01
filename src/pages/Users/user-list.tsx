import React, { useState, useEffect, useMemo } from "react";
import { Col, Container, Row, Badge, Spinner, Alert, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import ServerPagination from "../../components/Common/ServerPagination";
import DeleteModal from "../../components/Common/DeleteModal";
import { apiService } from "../../helpers/api";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phone: string;
  profilePicture: string | null;
  role: string;
  provider: string;
  dateOfBirth: string | null;
  createdAt: string;
  lastLogin: string | null;
  lastLogout: string | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const user = cellProps.row.original;
          return (
            <div className="d-flex align-items-center">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="rounded-circle me-2"
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                  style={{ width: '32px', height: '32px', fontSize: '12px' }}
                >
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              )}
              <div>
                <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                <div className="text-muted small">{user.userName}</div>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: 'Date of Birth',
        accessorKey: 'dateOfBirth',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const dateOfBirth = cellProps.getValue();
          if (!dateOfBirth) return <span className="text-muted">N/A</span>;
          
          return (
            <span>
              {new Date(dateOfBirth).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        header: 'Role',
        accessorKey: 'role',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const role = cellProps.getValue();
          let badgeColor = 'secondary';
          
          switch (role) {
            case 'superAdmin':
              badgeColor = 'danger';
              break;
            case 'admin':
              badgeColor = 'warning';
              break;
            case 'streamer':
              badgeColor = 'info';
              break;
            case 'viewer':
              badgeColor = 'success';
              break;
            default:
              badgeColor = 'secondary';
          }
          
          return (
            <Badge color={badgeColor} className="text-capitalize">
              {role}
            </Badge>
          );
        },
      },
      {
        header: 'Provider',
        accessorKey: 'provider',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const provider = cellProps.getValue();
          return (
            <Badge 
              color={provider === 'google' ? 'primary' : 'secondary'} 
              className="text-capitalize"
            >
              {provider}
            </Badge>
          );
        },
      },
      {
        header: 'Last Login',
        accessorKey: 'lastLogin',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const lastLogin = cellProps.getValue();
          if (!lastLogin) return <span className="text-muted">Never</span>;
          
          return (
            <span>
              {new Date(lastLogin).toLocaleDateString()} <br />
              <small className="text-muted">
                {new Date(lastLogin).toLocaleTimeString()}
              </small>
            </span>
          );
        },
      },
      {
        header: 'Created Date',
        accessorKey: 'createdAt',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const createdAt = cellProps.getValue();
          return (
            <span>
              {new Date(createdAt).toLocaleDateString()} <br />
              <small className="text-muted">
                {new Date(createdAt).toLocaleTimeString()}
              </small>
            </span>
          );
        },
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps: any) => {
          const user = cellProps.row.original;
          return (
            <div className="d-flex gap-2">
              {/* View Button */}
              {/* <button
                className="btn btn-sm btn-outline-info"
                onClick={() => handleView(user)}
                title="View User"
              >
                <i className="mdi mdi-eye"></i>
              </button> */}
              
              {/* Edit Button */}
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleEdit(user)}
                title="Edit User"
              >
                <i className="mdi mdi-pencil"></i>
              </button>
              
              {/* Delete Button */}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(user)}
                title="Delete User"
              >
                <i className="mdi mdi-delete"></i>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Fetch users data
  const fetchUsers = async (page: number = 1, limit: number = 10, isInitialLoad: boolean = false) => {
    try {
      // Set appropriate loading state
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError(null);
      
      console.log(`🔄 Fetching users - Page: ${page}, Limit: ${limit}`);
      
      const response: ApiResponse = await apiService.getUserList(page, limit);
      
      console.log('📊 API Response:', response);
      
      if (response.status === 200) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        setCurrentPage(page);
        console.log(`✅ Loaded ${response.data.users.length} users for page ${page}`);
      } else {
        setError(response.message || 'Failed to fetch users');
        console.error('❌ API Error:', response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('❌ Error fetching users:', err);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers(1, 10, true); // true for initial load
  }, []);

  // Action handlers
  const handleView = (user: User) => {
    console.log('👁️ View user:', user);
    // TODO: Navigate to user detail page or open modal
    // Example: navigate(`/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    console.log('✏️ Edit user:', user);
    navigate(`/users/${user.id}/edit`);
  };

  const handleDelete = (user: User) => {
    console.log('🗑️ Delete user:', user);
    setSelectedUser(user);
    setDeleteModal(true);
  };

  // Handle actual user deletion
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log(`🔄 Deleting user: ${selectedUser.firstName} ${selectedUser.lastName}`);

      const response = await apiService.deleteUser(selectedUser.id);
      
      if (response.status === 200) {
        setSuccessMessage(`User "${selectedUser.firstName} ${selectedUser.lastName}" has been deleted successfully!`);
        console.log("✅ User deleted successfully:", response);
        
        // Refresh the table data
        await fetchUsers(pagination.page, pagination.limit);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(response.message || "Failed to delete user");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
      console.error("❌ Error deleting user:", err);
    } finally {
      // Always close modal and reset selection after API call completes
      setDeleteModal(false);
      setSelectedUser(null);
      setDeleteLoading(false);
    }
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setDeleteModal(false);
    setSelectedUser(null);
  };

  // Meta title
  useEffect(() => {
    document.title = "User List | Skote - Vite React Admin & Dashboard Template";
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Users" breadcrumbItem="User List" />
          
                  {error && (
          <Row>
            <Col>
              <Alert color="danger" className="mb-4">
                <i className="mdi mdi-alert-circle-outline me-2"></i>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {successMessage && (
          <Row>
            <Col>
              <Alert color="success" className="mb-4">
                <i className="mdi mdi-check-circle-outline me-2"></i>
                {successMessage}
              </Alert>
            </Col>
          </Row>
        )}

          <Row>
            <Col>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title mb-0">User Management</h4>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        Total Users: <strong>{pagination.total}</strong>
                      </span>
                      {loading && <Spinner size="sm" color="primary" />}
                      <Button
                        color="primary"
                        onClick={() => navigate("/users/create")}
                      >
                        <i className="mdi mdi-plus me-1"></i>
                        Create User
                      </Button>
                    </div>
                  </div>

                  {loading && users.length === 0 ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <div className="mt-2">Loading users...</div>
                    </div>
                  ) : (
                    <>
                      <TableContainer
                        columns={columns}
                        data={users || []}
                        isGlobalFilter={false}
                        isPagination={false}
                        SearchPlaceholder={`Search ${pagination.total} users...`}
                        pagination="pagination"
                        paginationWrapper="dataTables_paginate paging_simple_numbers"
                        tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                        theadClass=""
                        divClassName=""
                        isBordered={false}
                        isCustomPageSize={false}
                        buttonClass=""
                        buttonName=""
                        isAddButton={false}
                        handleUserClick={() => {}}
                        isJobListGlobalFilter={false}
                      />
                      
                      {/* Server-side Pagination using reusable component */}
                      <ServerPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalRecords={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => {
                          console.log(`🔄 Going to page: ${page}`);
                          fetchUsers(page, pagination.limit);
                        }}
                        onPageSizeChange={(size) => {
                          console.log(`🔄 Changing page size to: ${size}`);
                          fetchUsers(1, size);
                        }}
                        loading={paginationLoading}
                        paginationClass="pagination dataTables_paginate paging_simple_numbers"
                        paginationDiv="col-sm-12 col-md-7"
                      />
                    </>
                  )}

                  {!loading && users.length === 0 && !error && (
                    <div className="text-center py-5">
                      <i className="mdi mdi-account-off-outline display-4 text-muted"></i>
                      <div className="mt-2">No users found</div>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleConfirmDelete}
          onCloseClick={handleDeleteModalClose}
          title="Delete User"
          message={`Are you sure you want to permanently delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
          deleteButtonText="Yes, Delete User"
          loading={deleteLoading}
        />
      </div>
    </React.Fragment>
  );
}