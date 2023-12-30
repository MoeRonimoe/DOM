class PointF{
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
}


class MyMathOP
{
    static Scalar(a, b)
    {
        return parseFloat(parseFloat(a.X) * parseFloat(b.X) + parseFloat(a.Y) * parseFloat(b.Y));
    }
    static Scale(a, factor)
    {
        return new PointF(parseFloat(parseFloat(a.X) * factor), parseFloat(parseFloat(a.Y) * factor));
    }
    static Add(a, b)
    {
        return new PointF(parseFloat(parseFloat(a.X) + parseFloat(b.X)), parseFloat(parseFloat(a.Y) + parseFloat(b.Y)));
    }
    static Subtract(a, b)
    {
        return new PointF(parseFloat(parseFloat(a.X) - parseFloat(b.X)), parseFloat(parseFloat(a.Y) - parseFloat(b.Y)));
    }
    //PointF p, PointF lineStart, PointF lineEnd
    static Punkt_auf_Linie(p, lineStart, lineEnd)
    {
        // Den zu p nähesten Punkt q auf der Strecke bestimmen
        var startToP = MyMathOP.Subtract(p,lineStart);
        var startToEnd = MyMathOP.Subtract(lineEnd,lineStart);

        var t = MyMathOP.Scalar(startToP,startToEnd) / MyMathOP.Scalar(startToEnd,startToEnd);
        t = Math.max(0, Math.min(t, 1));
        var q = MyMathOP.Add(lineStart,MyMathOP.Scale(startToEnd,t));

        // Abstand zwischen p und q berechnen
        var threshold = 3;
        var squared_distance = MyMathOP.Subtract(p,q);
        squared_distance = MyMathOP.Scalar((MyMathOP.Subtract(p,q)),squared_distance);
        return (squared_distance < (threshold * threshold));
    }
}