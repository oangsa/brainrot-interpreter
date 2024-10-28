def strToLstDict(lst: list) -> dict:
    arr: list[dict] = [];

    for i in range(len(lst)):
        a = [True for j in arr if lst[i] in j.values()];
        if a == []: 
            b: dict = {"char": lst[i], "ctr": 1, "index": [i]}
            arr.append(b);
        else:
            for j in arr:
                if lst[i] in j.values():
                    j["ctr"] += 1;
                    j["index"].append(i);

    return arr;


def main() -> int:

    str1: str = input();
    str2: str = input();

    idx: int = 0;
    ctr: int = 0;

    for i in strToLstDict(str2):
        for j in strToLstDict(str1):

            if j["char"] != i["char"]: continue;

            ctr += min([j["ctr"], i["ctr"]]);

            c: list[int] = j["index"] if len(j["index"]) < len(i["index"]) else i["index"]
            d: list[int] = i["index"] if len(j["index"]) < len(i["index"]) else j["index"]

            for k in c:
                if k in d: idx += 1;

            break;

    print(f"{idx}-{ctr-idx}")


    return 0;

if __name__ == "__main__":
    main();