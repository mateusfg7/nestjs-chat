import { ConversationRepositoryPort } from "@modules/chat/application/ports/conversation-repository.port";
import { Test, TestingModule } from "@nestjs/testing";
import { DeleteConversationCommand } from "./delete-conversation.command";
import { DeleteConversationHandler } from "./delete-conversation.handler";

describe("DeleteConversationHandler", () => {
  let handler: DeleteConversationHandler;
  let commandRepo: jest.Mocked<ConversationRepositoryPort>;

  beforeEach(async () => {
    commandRepo = {
      deleteConversation: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteConversationHandler,
        { provide: ConversationRepositoryPort, useValue: commandRepo },
      ],
    }).compile();

    handler = module.get<DeleteConversationHandler>(DeleteConversationHandler);
  });

  it("should successfully delete a conversation", async () => {
    commandRepo.deleteConversation.mockResolvedValue(true);
    const command = new DeleteConversationCommand("conv-1");

    const result = await handler.execute(command);

    expect(result).toBe(true);
    expect(commandRepo.deleteConversation).toHaveBeenCalledWith("conv-1");
  });

  it("should return false if conversation was not deleted", async () => {
    commandRepo.deleteConversation.mockResolvedValue(false);
    const command = new DeleteConversationCommand("conv-2");

    const result = await handler.execute(command);

    expect(result).toBe(false);
    expect(commandRepo.deleteConversation).toHaveBeenCalledWith("conv-2");
  });
});
