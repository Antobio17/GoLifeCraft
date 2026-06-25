import { of } from "rxjs";
import { CreateUserService } from "./create-user.service";
import { CreateUserPort } from "../../domain/ports/create-user.port";
import { CreateUserRequest } from "../../domain/models/create-user.model";

const mockRequest: CreateUserRequest = {
  username: "newuser",
  email: "new@test.com",
  name: "New",
  lastname: "User",
  password: "secret",
  role: "admin",
  canCreateFolder: false,
  canDeleteFolder: false,
  canUploadFile: false,
  canDeleteFile: false,
  canSignFile: false,
  canRollbackSign: false,
  canAccessUsers: false,
};

class MockCreateUserPort extends CreateUserPort {
  createUser = jasmine.createSpy("createUser").and.returnValue(of(void 0));
}

describe("CreateUserService", () => {
  let service: CreateUserService;
  let mockPort: MockCreateUserPort;

  beforeEach(() => {
    mockPort = new MockCreateUserPort();
    service = new CreateUserService(mockPort);
  });

  it("should delegate createUser to the port", () => {
    service.createUser(mockRequest).subscribe();
    expect(mockPort.createUser).toHaveBeenCalledWith(mockRequest);
  });

  it("should return the observable from the port", (done) => {
    service.createUser(mockRequest).subscribe(() => done());
  });
});
