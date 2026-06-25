import { of } from "rxjs";
import { GetUsersService } from "./get-users.service";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { GetUsersResponse } from "../../domain/models/get-users-response.model";

const mockResponse: GetUsersResponse = {
  meta: { pageNumber: 1, pageSize: 10, total: 0 },
  data: [],
};

class MockGetUsersPort extends GetUsersPort {
  getUsers = jasmine.createSpy("getUsers").and.returnValue(of(mockResponse));
}

describe("GetUsersService", () => {
  let service: GetUsersService;
  let mockPort: MockGetUsersPort;

  beforeEach(() => {
    mockPort = new MockGetUsersPort();
    service = new GetUsersService(mockPort);
  });

  it("should delegate getUsers to the port with default pagination", () => {
    service.getUsers().subscribe();
    expect(mockPort.getUsers).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      undefined,
      undefined,
    );
  });

  it("should pass all parameters to the port", () => {
    service.getUsers(2, 20, "john", "j@t.com", "admin").subscribe();
    expect(mockPort.getUsers).toHaveBeenCalledWith(
      2,
      20,
      "john",
      "j@t.com",
      "admin",
    );
  });

  it("should return the observable from the port", (done) => {
    service.getUsers().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });
  });
});
