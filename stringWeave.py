def isOdd(n: int) -> bool: return (n % 2 != 0)

def main() -> int:
    gIpt: str = input();
    ctr: int = 0;
    bCtr: int = 0;

    for i in range(len(gIpt)):
        if not isOdd(i):
            print(gIpt[ctr], end=""); ctr += 1;

        else:
            print(gIpt[(len(gIpt) - 1) - bCtr], end=""); bCtr += 1;

    return 0;


if __name__ == "__main__":
    main();
