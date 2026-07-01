import { Command } from "./types";

class CommandRegistry {
  private commands = new Map<string, Command>();

  /**
   * Register a new command.
   * Returns a cleanup function to unregister.
   */
  register(command: Command): () => void {
    this.commands.set(command.id, command);
    return () => this.unregister(command.id);
  }

  /**
   * Unregister a command by ID.
   */
  unregister(id: string): void {
    this.commands.delete(id);
  }

  /**
   * Get all registered commands.
   */
  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get a command by ID.
   */
  getCommandById(id: string): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Clear all registered commands.
   */
  clear(): void {
    this.commands.clear();
  }
}

export const commandRegistry = new CommandRegistry();
