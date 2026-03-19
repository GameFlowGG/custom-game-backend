export interface Player {
  accountId: string;
  username: string;
  ready: boolean;
}

export interface Lobby {
  id: string;
  code: string;
  isPrivate: boolean;
  teamA: Player[];
  teamB: Player[];
  ownerId: string;
}
