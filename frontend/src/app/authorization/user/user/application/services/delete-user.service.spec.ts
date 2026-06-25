import { of } from "rxjs";
import { DeleteUserService } from "./delete-user.service";
import { DeleteUserPort } from "../../domain/ports/delete-user.port";

class MockDeleteUserPort extends DeleteUserPort {
  deleteUser = jasmine.createSpy("deleteUser").and.returnValue(of(void 0));
}

describe("DeleteUserService", () => {
  let service: DeleteUserService;
  let mockPort: MockDeleteUserPort;

  beforeEach(() => {
    mockPort = new MockDeleteUserPort();
    service = new DeleteUserService(mockPort);
  });

  it("should delegate deleteUser to the port with the given id", () => {
    service.deleteUser("user-123").subscribe();
    expect(mockPort.deleteUser).toHaveBeenCalledWith("user-123");
  });

  it("should return the observable from the port", (done) => {
    service.deleteUser("user-123").subscribe(() => done());
  });
});
