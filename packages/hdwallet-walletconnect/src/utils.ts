export const extractEip155AccountData = (acc: string) => {
  const accRegExp = acc.match(/^eip155:([0-9]+):(\w*)$/);
  if (!accRegExp) return;
  return { type: "EIP155", chainId: Number(accRegExp[1]), address: accRegExp[2] };
};
