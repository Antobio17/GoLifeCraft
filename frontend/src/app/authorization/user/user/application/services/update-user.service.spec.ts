import { of } from "rxjs";
import { UpdateUserService } from "./update-user.service";
import { UpdateUserPort } from "../../domain/ports/update-user.port";
import { UpdateUserRequest } from "../../domain/models/update-user-request.model";
import { GetUserResponse } from "../../domain/models/get-user-response.model";

const mockRequest: UpdateUserRequest = {
  username: "updated.user",
  name: "Updated",
  lastname: "User",
  email: "u@test.com",
  isActive: true,
  role: "admin",
};

const mockGetUserResponse: GetUserResponse = {
  data: {
    id: "u1",
    type: "user",
    attributes: {
      username: "u1",
      email: "u@test.com",
      name: "User",
      lastname: "One",
      isActive: true,
      role: "admin",
      createdAt: "",
      updatedAt: "",
    },
  },
};

class MockUpdateUserPort extends UpdateUserPort {
  updateUser = jasmine.createSpy("updateUser").and.returnValue(of(void 0));
  getUser = jasmine
    .createSpy("getUser")
    .and.returnValue(of(mockGetUserResponse));
}

describe("UpdateUserService", () => {
  let service: UpdateUserService;
  let mockPort: MockUpdateUserPort;

  beforeEach(() => {
    mockPort = new MockUpdateUserPort();
    service = new UpdateUserService(mockPort);
  });

  it("should delegate updateUser to the port", () => {
    service.updateUser("user-1", mockRequest).subscribe();
    expect(mockPort.updateUser).toHaveBeenCalledWith("user-1", mockRequest);
  });

  it("should delegate getUser to the port", () => {
    service.getUser("user-1").subscribe();
    expect(mockPort.getUser).toHaveBeenCalledWith("user-1");
  });

  it("should return observable from getUser", (done) => {
    service.getUser("user-1").subscribe((res) => {
      expect(res).toEqual(mockGetUserResponse);
      done();
    });
  });
});
